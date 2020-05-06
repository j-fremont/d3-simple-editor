import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAlignLeft, faAlignRight, faAlignCenter, faAlignJustify, faEraser, faTrash, faDownload,  } from '@fortawesome/free-solid-svg-icons'
import MyButtonSave from '../components/buttonsave.react';
import MyButtonLoad from '../components/buttonload.react';

export default class MyButtonGroup extends React.Component {
  render() {
    return (
      <ButtonGroup>
        <Button onClick={this.props.onAlignLeft} color="light"><FontAwesomeIcon icon={faAlignLeft} /></Button>
        <Button onClick={this.props.onAlignRight} color="light"><FontAwesomeIcon icon={faAlignRight} /></Button>
        <Button onClick={this.props.onAlignCenterX} color="light"><FontAwesomeIcon icon={faAlignCenter} /></Button>
        <Button onClick={this.props.onJustifyX} color="light"><FontAwesomeIcon icon={faAlignJustify} /></Button>
        <Button onClick={this.props.onAlignTop} color="light"><FontAwesomeIcon icon={faAlignLeft} class="svg-inline--fa fa-w-14 fa-rotate-90"/></Button>
        <Button onClick={this.props.onAlignBottom} color="light"><FontAwesomeIcon icon={faAlignRight} class="svg-inline--fa fa-w-14 fa-rotate-90"/></Button>
        <Button onClick={this.props.onAlignCenterY} color="light"><FontAwesomeIcon icon={faAlignCenter} class="svg-inline--fa fa-w-14 fa-rotate-90"/></Button>
        <Button onClick={this.props.onJustifyY} color="light"><FontAwesomeIcon icon={faAlignJustify} class="svg-inline--fa fa-w-14 fa-rotate-90"/></Button>
        <Button onClick={this.props.onErase} color="light"><FontAwesomeIcon icon={faEraser} /></Button>
        <MyButtonSave onSave={this.props.onSave} />
        <MyButtonLoad onLoad={this.props.onLoad} />
        <Button onClick={this.props.onDelete} color="light"><FontAwesomeIcon icon={faTrash} /></Button>
      </ButtonGroup>
    );
  }
};
