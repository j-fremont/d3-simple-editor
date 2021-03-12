import * as d3 from "d3";

export default class Editor {

  constructor() {

    this.selectedNodes = []; // Liste des noeuds selectionnés en cours
    this.selectedLinks = []; // Liste des liens selectionnés en cours

    this.currentDrag = {
      node: undefined, // Noeud en cours de drag-drop
      targetLinks: [], // Liste des liens dont le noeud en cours de drag-drop est l'extrémité cible
      sourceLinks: [] // Liste des liens dont le noeud en cours de drag-drop est l'extrémité source
    };

    this.svg = d3.select("#editor").select("svg");
    this.paths = d3.select("#paths");
    this.icons = d3.select("#icons");
    this.palette = d3.select("#palette");

    // Path SVG utilisé lors de la construction d'un lien : ce path est montré qd il y a un lien en construction, il est caché sinon.
    this.dragLine = this.svg.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    this.tooltip = d3.select("#editor").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    this.PALETTE_WIDTH = 160; // Largeur de la palette
    this.PALETTE_HEIGHT = 500; // Hauteur de la palette
    this.HALF_ICON_SIZE = 25; // Taille de le moitié d'un icone
    this.MAX_PALETTE_ICONS = 30; // Nombre max. d'icônes dans la palette

    this.palette.append('rect')
        .attr("x", 20)
        .attr("y", 20)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", this.PALETTE_WIDTH)
        .attr("height", this.PALETTE_HEIGHT)
        .attr("fill", '#424242');

    // Liste des noeuds
    this.nodes = [
      {id: 0, x: 40, y: 40, type: 'style1', text: '#icon-1'},
      {id: 1, x: 110, y: 40, type: 'style1', text: '#icon-2'},
      {id: 2, x: 40, y: 110, type: 'style1', text: '#icon-3'},
      {id: 3, x: 110, y: 110, type: 'style1', text: '#icon-4'},
      {id: 4, x: 40, y: 180, type: 'style2', text: '#icon-5'},
      {id: 5, x: 110, y: 180, type: 'style2', text: '#icon-6'},
      {id: 6, x: 40, y: 250, type: 'style2', text: '#icon-7'},
      {id: 7, x: 110, y: 250, type: 'style2', text: '#icon-8'},
      {id: 8, x: 40, y: 320, type: 'style3', text: '#icon-9'},
      {id: 9, x: 110, y: 320, type: 'style3', text: '#icon-10'},
      {id: 10, x: 40, y: 390, type: 'style3', text: '#icon-11'},
      {id: 11, x: 110, y: 390, type: 'style3', text: '#icon-12'}
    ];

    this.nodeId = 10; // Id du dernier noeud créé (cet id est un incrément, les ids inférieurs à la valeur de départ sont réservés aux noeuds de la palette)
    this.linkId = 0; // Id du dernier lien créé (cet id est un incrément à partir de 0)

    // Liste des liens entre les noeuds
    this.links = [];

    // Pour capter les évenements de la souris
    this.svg.on('mousedown', this.mouseDown).on('mousemove', this.mouseMove);

    this.compareX = (a,b) => a.x>b.x ? 1 : (b.x>a.x ? -1 : 0); // Classe les noeuds suivant leurs coordonnée x
    this.compareY = (a,b) => a.y>b.y ? 1 : (b.y>a.y ? -1 : 0); // Classe les noeuds suivant leurs coordonnée y

    // Pour capter les évenements du clavier
    d3.select(window).on('keydown', this.keyDown);

    // Dessin de la grille
    this.HEIGHT = 600;
    this.WIDTH = 1200;
    this.CELL_SIZE = 50;
    
    const nbHeight = this.HEIGHT/this.CELL_SIZE;
    const nbWidth = (this.WIDTH-200)/this.CELL_SIZE;
   
    let d = "";
    for (let i=5; i<nbWidth+4; i++) { d = d + 'M' + i*this.CELL_SIZE + ',0V' + this.HEIGHT; } // i=5 pour commencer les verticales de la grille à droite de la palette
    for (let i=1; i<nbHeight; i++) { d = d + 'M200,' + i*this.CELL_SIZE + 'H' + this.WIDTH; }
    d3.select('#grid').attr('d', d);

};

  // ---
  //
  // Fonctions de sélection rectangulaire
  //
  // ---

  // mouseDown : gestion du click souris sur le fond du dessin. Les clicks sur les noeuds et les liens sont captés par nodeClicked et linkClicked.
  mouseDown = () => {

    if (d3.event.defaultPrevented) return;

    this.dragLine.classed('hidden', true); // On cache la ligne de construction des liens...
    this.unselectAll(); // ...et on déselectionne les noeuds et les liens cliqués.

    // Puis en créer le rectangle de selection.
    var subject = d3.select(window), parent = this.svg.node().parentNode, start = d3.mouse(parent);

    var selection = this.svg.append("svg:path")
      .attr("class", "selection")
      .attr("visibility", "hidden");

    // rect : dessin du rectangle de la selection.
    var rect = (x, y, w, h) => {
      return "M"+[x,y]+" l"+[w,0]+" l"+[0,h]+" l"+[-w,0]+"z";
    };

    // startSelection : début de la selection.
    var startSelection = function() {
      selection.attr("d", rect(start[0], start[0], 0, 0)).attr("visibility", "visible");
    };

    // moveSelection : selection en cours.
    var moveSelection = function(start) {
      var moved = d3.mouse(parent);
      selection.attr("d", rect(start[0], start[1], moved[0]-start[0], moved[1]-start[1])); // Déplacement des coordonnées du rectangle de selection
    };

    // endSelection : fin de la selection.
    var endSelection = () => {
      var xs=selection.node().pathSegList[0].x, // x start : origine en X de la selection
        ys=selection.node().pathSegList[0].y, // y start : origine en Y de la selection
        xd=selection.node().pathSegList[1].x, // x delta : delta en X de la selection
        yd=selection.node().pathSegList[2].y, // y delta : delta en Y de la selection
        xe, // x end : fin en X de la selection
        ye; // y end : fin en Y de la selection
      if (xd<0) { xe=xs; xs=xs+xd; } else { xe=xs+xd; } // Calcul des bords de la selection en X
      if (yd<0) { ye=ys; ys=ys+yd; } else { ye=ys+yd; } // Calcul des bords de la selection en Y

      // Alimente la liste des noeuds cliqués avec les noeuds dont les coordonnées sont comprise dans le rectangle de selection
      this.nodes.forEach((n) => {
        var x = n.x;
        var y = n.y;
        if (x>xs && x<xe && y>ys && y<ye) { // Si le noeud est dans la selection
          this.selectedNodes.push(n);
          d3.select("#node"+n.id).select("use").classed("selected",true);
        }
      });
    };

    startSelection();

    subject.on("mousemove", function() {
      moveSelection(start);
    }).on("mouseup", function() {
      selection.remove();
      endSelection();
      subject.on("mousemove", null).on("mouseup", null);
    });
  };

  // ---
  //
  // Fonctions de dessin des éléments
  //
  // ---

  // drawnodes : redessine l'ensemble des icones des noeuds.
  drawNodes = () => {

    var drag = d3.drag() // Pour capter les évenements de drag-drop
      .on("start", this.dragStarted) // Début de drag-drop d'une icone
      .on("drag", this.dragged) // Icone en cours de déplacement lord d'un drag-drop
      .on("end", this.dragEnded); // Fin de drag-drop d'une icone

    var nodes = this.icons.selectAll('g')
      .data(this.nodes, (d) => d.id);

    var tooltip = this.tooltip;

    nodes.enter()
      .append('g')
      .attr("id", (d) => "node"+d.id) // L'attribut id du <g> d'un icone est 'node' suivant du numéro unique de l'icone.
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }) // Coordonnées d'origine de l'icone.
      .classed("draggable", true)
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.text.substring(d.text.indexOf('#')+1))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("width", d.text.length * 8 + "px");
        })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        })
      .on("click", this.nodeClicked)
      .append("use")
      .attr("class", (d) => d.type)
      .classed("selected", false)
      .attr("xlink:href", (d) => d.text); // Ajout d'un <use> au <g> de l'icone pour le lien avec la représentation SVG de cet icone.

    nodes.exit().remove();

    this.icons.selectAll(".draggable").call(drag).data(this.nodes);
  };

  // drawLinks : redessine l'ensemble des liens entre les icones des noeuds.
  drawLinks = () => {
    var links = this.paths.selectAll('path')
      .data(this.links, (d) => d.id);

    links.enter()
      .append('path')
      .attr('class', 'link')
      .attr('id', (d) => "link"+d.id)
      .attr('d', (d) => {
        const sourceX = d.source.x+this.HALF_ICON_SIZE;
        const sourceY = d.source.y+this.HALF_ICON_SIZE;
        const targetX = d.target.x+this.HALF_ICON_SIZE;
        const targetY = d.target.y+this.HALF_ICON_SIZE;
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      })
      .on("click", this.linkclicked);

    links.exit().remove();
  };

  // repositionLinks : repositionne les liens passés en paramètres, suite par exemple à une mise à jour des coordonnées x et y de leurs noeuds source et target.
  repositionLinks = (links) => {
    this.links.forEach((l) => {
      const sourceX = l.source.x+this.HALF_ICON_SIZE;
      const sourceY = l.source.y+this.HALF_ICON_SIZE;
      const targetX = l.target.x+this.HALF_ICON_SIZE;
      const targetY = l.target.y+this.HALF_ICON_SIZE;
      d3.select("#link"+l.id).attr('d', `M${sourceX},${sourceY}L${targetX},${targetY}`);
    });
  };

  // ---
  //
  // Fonctions de capture des actions utilisateur (voir également mouseDown, plus haut)
  //
  // ---

  // mouseMove : gestion du mouvement souris.
  mouseMove = () => {
    var parent = this.svg.node().parentNode, position = d3.mouse(parent);
    if (this.selectedNodes.length!==0) { // Si il y a un noeud qui a été cliqué, on est en train de créer un lien à partir de ce neud...
      // ...met à jour les coordonnées du lien pendant le déplacement du noeud.
      this.dragLine.attr('d', `M${this.selectedNodes[0].x+this.HALF_ICON_SIZE},${this.selectedNodes[0].y+this.HALF_ICON_SIZE}L${position[0]},${position[1]}`);
    }
  };

  // keydown : gestion des touches du clavier.
  keyDown = (d) => {

    d3.event.preventDefault();

    switch (d3.event.keyCode) {
      case 46: // Touche 'Suppr'
        this.removeSelected();
        break;
      default:
        break;
      }
  };

  // nodeclicked : gestion du click sur une boite.
  nodeClicked = (d, i) => {

    if (d3.event.defaultPrevented) return;

    this.unselectLinks(); // On déselectionne les éventuels liens cliqués.

    if (this.selectedNodes.length===0) { // Si on avait pas cliqué sur l'icone d'un noeud avant ce click, cela veut dire que l'on commence à créer un lien (départ du noeud source)...
      this.selectedNodes.push(d);
      d3.select("#node"+d.id).select("use").classed("selected",true); // ...on selectionne l'icone cliqué...
      // ...et on montre la ligne de construction des liens.
      this.dragLine.classed('hidden', false)
        .attr('d', `M${this.selectedNodes[0].x+this.HALF_ICON_SIZE},${this.selectedNodes[0].y+this.HALF_ICON_SIZE}
          L${this.selectedNodes[0].x+this.HALF_ICON_SIZE},${this.selectedNodes[0].y+this.HALF_ICON_SIZE}`);

    } else { // Si on avait cliqué sur l'icone d'un noeud avant ce click, cela veut dire que l'on termine la création d'un lien (arrivée sur le noeud cible)...
      if (d!==this.selectedNodes[0]) { // ...on vérifie que l'icone source du lien en cours de création n'est pas aussi l'icone cible...
        this.links.push({id:this.linkId++, source:this.selectedNodes[0], target:d}); // ...on créé le lien dans la liste des liens...
        this.drawLinks(); // ...puis on l'ajoute au group SVG des liens.
      }
      this.dragLine.classed('hidden', true); // On cache la ligne de construction des liens...
      this.unselectNodes(); // ...et on déselectionne les noeuds cliqués.
    }
  };

  // linkclicked : gestion du click sur un lien.
  linkclicked = (d, i) => {

    if (d3.event.defaultPrevented) return;

    this.unselectNodes(); // On déselectionne les éventuels noeuds cliqués
    this.selectedLinks.push(d);
    d3.select("#link"+d.id).classed("selected",true); // On selectionne le lien cliqué
  };

  // ---
  //
  // Fonctions drag & drop
  //
  // ---

  // dragStarted : gestion du début de glissé d'un noeud (drag).
  dragStarted = (d) => {
    d3.event.sourceEvent.stopPropagation();
    this.currentDrag.node = d;
    if (d.x<this.PALETTE_WIDTH) {
      // Si l'icone qui est glissé provient de la palette (x<PALETTE_SIZE), on créé immédiatement un nouvel icone dans la palette pour le remplacer.
      this.nodes.push({id: this.nodeId++, x: d.x, y: d.y, type: d.type, text: d.text});
      this.drawNodes();
    } else {
      // Si l'icone qui est glissé provient du dessin (x>PALETTE_SIZE), on récupère ses liens éventuels pour modifier leurs coordonnées pendant le glissé (cf. dragged).
      this.currentDrag.targetLinks = this.links.filter((l) => l.target.id === d.id);
      this.currentDrag.sourceLinks = this.links.filter((l) => l.source.id === d.id);
    }
  };

  dragged = (d) => {
    d.x = d3.event.x;
    d.y = d3.event.y;
    //console.log(d.x + ',' + d.y);

    //if (d.x%5===0 || d.y%5===0) {

      // Pendant le glissé : modification des coordonnées de l'icone et de son opacité...
      d3.select("#node"+d.id).attr('transform', (d) => `translate(${d.x},${d.y})`).style("opacity", 0.2);
      // ...puis modification des coordonnées des liens qui ont cet icone pour élement source...
      this.repositionLinks(this.currentDrag.sourceLinks);
      // ...et enfin modification des coordonnées des liens qui ont cet icone pour élement cible.
      this.repositionLinks(this.currentDrag.targetLinks);

    //}
  };

  // dragEnded : gestion du déposé d'un noeud (drop).
  dragEnded = (d) => {
    if (d.x<this.PALETTE_WIDTH) { // Si la coordonnées x du noeud déposé est dans la palette...
      this.removeNodes([this.currentDrag.node]); // ...supprime ce noeud...
      this.removeLinks(this.links.filter((l) => l.source === this.currentDrag.node || l.target === this.currentDrag.node));
    } else {
      d3.select("#node"+d.id).style("opacity", 1.0); // Retour à l'opacité d'origine pour l'icone du noeud déposé
    }
    this.currentDrag = {
      node: null,
      targetLinks: [],
      sourceLinks: []
    };
  };

  // ---
  //
  // Fonctions d'alignement des icônes
  //
  // ---

  // alignLeft : aligne à gauche les icones des noeuds selectionnés.
  alignLeft = () => {
    if (this.selectedNodes.length!==0) {
      var selectedNodeWithMinX = this.selectedNodes.reduce((min,n) => { // Trouve la coordonnées x minimale des noeuds selectionnés...
        min = (min===undefined || n.x < min.x) ? n : min;
        return min;
      });
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés...
        if (n!==selectedNodeWithMinX) { // ...autre que le noeud avec la coordonnées x minimale...
          n.x = selectedNodeWithMinX.x;
          d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
          var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
          this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
        }
      });
      this.unselectNodes();
    }
  };

  // alignright : aligne à droite les icones des noeuds selectionnés.
  alignRight = () => {
    if (this.selectedNodes.length!==0) {
      var selectedNodeWithMaxX = this.selectedNodes.reduce((max,n) => { // Trouve la coordonnées x maximale des noeuds selectionnés...
        max = (max===undefined || n.x > max.x) ? n : max;
        return max;
      });
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés...
        if (n!==selectedNodeWithMaxX) { // ...autre que le noeud avec la coordonnées x maximale...
          n.x = selectedNodeWithMaxX.x;
          d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
          var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
          this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
        }
      });
      this.unselectNodes();
    }
  };

  // aligntop : aligne en haut les icones des noeuds selectionnés.
  alignTop = () => {
    if (this.selectedNodes.length!==0) {
      var selectedNodeWithMinY = this.selectedNodes.reduce((min,n) => { // Trouve la coordonnées y minimale des noeuds selectionnés...
        min = (min===undefined || n.y < min.y) ? n : min;
        return min;
      });
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés...
        if (n!==selectedNodeWithMinY) { // ...autre que le noeud avec la coordonnées y minimale...
          n.y = selectedNodeWithMinY.y;
          d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
          var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
          this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
        }
      });
      this.unselectNodes();
    }
  };

  // alignbottom : aligne en bas les icones des noeuds selectionnés.
  alignBottom = () => {
    if (this.selectedNodes.length!==0) {
      var selectedNodeWithMaxY = this.selectedNodes.reduce((max,n) => { // Trouve la coordonnées y maximale des noeuds selectionnés...
        max = (max===undefined || n.y > max.y) ? n : max;
        return max;
      });
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés...
        if (n!==selectedNodeWithMaxY) { // ...autre que le noeud avec la coordonnées y maximale...
          n.y = selectedNodeWithMaxY.y;
          d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
          var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
          this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
        }
      });
      this.unselectNodes();
    }
  };

  // alignCenterX : aligne les icones des noeuds selectionnés sur leur moyenne des coordonnées x.
  alignCenterX = function() {
    if (this.selectedNodes.length!==0) {
      var mean = this.selectedNodes.map(n => n.x).reduce((s,x) => s+x)/this.selectedNodes.length;
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés.
        n.x = mean;
        d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
        var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
        this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
      });
      this.unselectNodes();
    }
  };

  // alignCenterY : aligne les icones des noeuds selectionnés sur leur moyenne des coordonnées y.
  alignCenterY = function() {
    if (this.selectedNodes.length!==0) {
      var mean = this.selectedNodes.map(n => n.y).reduce((s,y) => s+y)/this.selectedNodes.length;;
      this.selectedNodes.forEach((n) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés.
        n.y = mean;
        d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
        var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
        this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
      });
      this.unselectNodes();
    }
  };

  // justifyX : recentre les icones des noeuds selectionnés en x.
  justifyX = function() {
    if (this.selectedNodes.length!==0) {
      this.selectedNodes.sort(this.compareX);
      var min = this.selectedNodes[0].x;
      var delta = (this.selectedNodes[this.selectedNodes.length-1].x - min) / (this.selectedNodes.length-1); // Trouve le delta en x des noeuds selectionnés...
      this.selectedNodes.forEach((n,i) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés.
        n.x = min + (delta * i);
        d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
        var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
        this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
      });
      this.unselectNodes();
    }
  };

  // justifyY : recentre les icones des noeuds selectionnés en y.
  justifyY = function() {
    if (this.selectedNodes.length!==0) {
      this.selectedNodes.sort(this.compareY);
      var min = this.selectedNodes[0].y;
      var delta = (this.selectedNodes[this.selectedNodes.length-1].y - min) / (this.selectedNodes.length-1); // Trouve le delta en y des noeuds selectionnés...
      this.selectedNodes.forEach((n,i) => { // ...puis affecte cette coordonnée à tous les noeuds selectionnés.
        n.y = min + (delta * i);
        d3.select("#node"+n.id).attr('transform', (d) => `translate(${d.x},${d.y})`);
        var toReposition = this.links.filter((l) => (l.source === n || l.target === n));
        this.repositionLinks(toReposition); // ... et replace les éventuels liens de ces autres noeuds selectionnés.
      });
      this.unselectNodes();
    }
  };

  // erase : efface les éléments sélectionnés.
  erase = function() {
    this.removeSelected();
  };

  // ---
  //
  // Fonctions de gestion des éléments sélectionnés
  //
  // ---

  // unselectNodes : déselectionne l'ensemble des noeuds et des liens cliqués en cours.
  unselectAll = () => {
    this.unselectNodes();
    this.unselectLinks();
  };

  // unselectNodes : déselectionne l'ensemble des noeuds cliqués en cours.
  unselectNodes = () => {
    this.selectedNodes.forEach((n) => {
      d3.select("#node"+n.id).select("use").classed("selected",false);
    });
    this.selectedNodes = [];
  };

  // unselectLinks : déselectionne l'ensemble des liens cliqués en cours.
  unselectLinks = () => {
    this.selectedLinks.forEach((l) => {
      d3.select("#link"+l.id).classed("unselected",true).classed("selected",false);
    });
    this.selectedLinks = [];
  };

  // spliceLinksForNode : supprime les liens dont le noeud en paramètre est l'extrémité source ou cible.
  spliceLinksForNode = (node) => {
    var toSplice = this.links.filter((l) => l.source === node || l.target === node);
    for (var l of toSplice) {
      this.links.splice(this.links.indexOf(l), 1);
    }
  };

  // removeNodes : supprime les noeuds dans la liste en paramètre.
  removeNodes = (toRemove) => {
    toRemove.forEach((n) => {
      this.nodes.splice(this.nodes.indexOf(n), 1);
      this.spliceLinksForNode(n);
    });
    // On retire les noeuds supprimés du group SVG des icones.
    this.icons.selectAll('g')
      .data(this.nodes, (d) => d.id)
      .exit()
      .remove();
  };

  // removeLinks : supprime les liens dans la liste en paramètre.
  removeLinks = (toRemove) => {
    toRemove.forEach((l) => {
      this.links.splice(this.links.indexOf(l), 1);
    });
    // On retire les liens supprimés du group SVG des liens.
    this.paths.selectAll('path')
      .data(this.links, (d) => d.id)
      .exit()
      .remove();
  };

  // removeSelected : efface les noeuds et les liens cliqués.
  removeSelected = () => {
    this.removeNodes(this.selectedNodes);
    this.removeLinks(this.selectedLinks);
    // Vidage des listes de noeuds et de liens cliqués
    this.selectedNodes = [];
    this.selectedLinks = [];
    // On cache la ligne de construction des liens.
    this.dragLine.classed('hidden', true);
  };

  // ---
  //
  // Fonctions de chargement et de sauvegarde
  //
  // ---

  // saveNodesAndLinks : retourne les noeuds et les liens à sauvegarder.
  saveNodesAndLinks = () => {
    var nodeId = this.MAX_PALETTE_ICONS;

    const nodes = this.nodes.filter(node => node.x>this.PALETTE_WIDTH);

    nodes.forEach(node => { node.id = nodeId++; });

    const links = this.links.map(link => {
      return {
        id: link.id,
        source: {
          id: link.source.id
        },
        target: {
          id: link.target.id
        }
      }
    });

    return({
      nodes: nodes,
      links: links
    })
  };

  // loadNodesAndLinks : charge les noeuds et les liens en paramètre.
  loadNodesAndLinks = (nodesAndLinks) => {

    this.nodes = [];
    this.drawNodes();

    this.nodes = [
      {id: 0, x: 40, y: 40, type: 'style1', text: '#icon-1'},
      {id: 1, x: 110, y: 40, type: 'style1', text: '#icon-2'},
      {id: 2, x: 40, y: 110, type: 'style1', text: '#icon-3'},
      {id: 3, x: 110, y: 110, type: 'style1', text: '#icon-4'},
      {id: 4, x: 40, y: 180, type: 'style2', text: '#icon-5'},
      {id: 5, x: 110, y: 180, type: 'style2', text: '#icon-6'},
      {id: 6, x: 40, y: 250, type: 'style2', text: '#icon-7'},
      {id: 7, x: 110, y: 250, type: 'style2', text: '#icon-8'},
      {id: 8, x: 40, y: 320, type: 'style3', text: '#icon-9'},
      {id: 9, x: 110, y: 320, type: 'style3', text: '#icon-10'},
      {id: 10, x: 40, y: 390, type: 'style3', text: '#icon-11'},
      {id: 11, x: 110, y: 390, type: 'style3', text: '#icon-12'}
    ];

    nodesAndLinks.nodes.forEach(node => { this.nodes.push(node); })
    this.drawNodes();

    this.links = [];
    this.drawLinks();

    var linksWithRefs = nodesAndLinks.links.map(link => {
      const source = this.nodes.find(node => node.id===link.source.id);
      const target = this.nodes.find(node => node.id===link.target.id);
      return({
        id: link.id,
        source: source,
        target: target
      })
    });

    this.links = linksWithRefs;
    this.drawLinks();
  };

};
