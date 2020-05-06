import React from 'react';
import { Media } from 'reactstrap';
import Logo from '../icon.png';

const style = {
  'width': '128px',
  'margin-right': '25px'
};

export default class MyMedia extends React.Component {

  diagram = () => {
    if (this.props.diagram===undefined) {
      return 'Nouveau diagramme';
    } else {
      return 'Diagramme ' + this.props.diagram;
    }
  }

  render() {

    const diagram = this.diagram();

    return (
      <Media>
        <Media left href="#">
          <Media style={style} object src={Logo} alt="Logo EDF" />
        </Media>
        <Media body>
          <Media heading>
            Maquette de création de diagramme
          </Media>
          {diagram}
        </Media>
      </Media>
    );
  }
};
