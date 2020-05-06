import React from 'react';
import { Container, Row, Col, Input } from 'reactstrap';
import MyMedia from '../components/media.react';
import MyButtonGroup from '../components/buttongroup.react';
import MySchema from '../components/schema.react';
import Editor from '../editor'
import axios from "axios";

const config = require('../config');

export default class MyContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editor: {},
      diagram: undefined
    };
  }

  componentDidMount() {
    //Editor();
    var e = new Editor();
    e.drawNodes();
    this.setState({
      editor: e
    });
  }

  alignLeft = () => {
    this.state.editor.alignLeft();
  }

  alignRight = () => {
    this.state.editor.alignRight();
  }

  alignTop = () => {
    this.state.editor.alignTop();
  }

  alignBottom = () => {
    this.state.editor.alignBottom();
  }

  alignCenterX = () => {
    this.state.editor.alignCenterX();
  }

  alignCenterY = () => {
    this.state.editor.alignCenterY();
  }

  justifyX = () => {
    this.state.editor.justifyX();
  }

  justifyY = () => {
    this.state.editor.justifyY();
  }

  erase = () => {
    this.state.editor.erase();
  }

  save = (name) => {
    //var name = "test";
    const nodesAndLinks = this.state.editor.saveNodesAndLinks();
    axios.post("http://" + config.server.host + ":" + config.server.port + "/save/" + name, nodesAndLinks)
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }

  load = (name) => {

    //var name = "test";
    axios.get("http://" + config.server.host + ":" + config.server.port + "/list")
      .then((response) => {

        console.log(response);


      }, (error) => {
        console.log(error);
      });


    this.setState({
      diagram: name
    });


    //var name = "test";
    axios.get("http://" + config.server.host + ":" + config.server.port + "/load/" + name)
      .then((response) => {

        console.log(response);

        this.state.editor.loadNodesAndLinks(response.data);
      }, (error) => {
        console.log(error);
      });
  }

  delete = () => {
    axios.delete("http://" + config.server.host + ":" + config.server.port)
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }

  getDiagram = () => {
    return this.state.diagram;
  }

  render() {
    return (
      <Container fluid={true}>
        <Row>
          <Col>
            <MyMedia diagram={this.state.diagram}/>
          </Col>
          <Col>
            <MyButtonGroup
              onAlignLeft={this.alignLeft}
              onAlignRight={this.alignRight}
              onAlignTop={this.alignTop}
              onAlignBottom={this.alignBottom}
              onAlignCenterX={this.alignCenterX}
              onAlignCenterY={this.alignCenterY}
              onJustifyX={this.justifyX}
              onJustifyY={this.justifyY}
              onErase={this.erase}
              onSave={this.save}
              onLoad={this.load}
              onDelete={this.delete}/>
          </Col>
        </Row>
        <Row id="editor">
          <MySchema onSelectNode={this.selectNode}/>
        </Row>
      </Container>
    );
  }
}
