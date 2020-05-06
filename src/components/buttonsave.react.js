import React from 'react';
import { Button, Form, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, CustomInput } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

export default class MyButtonSave extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      text: ''
    };

    this.toggle = this.toggle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleKeyDown = (event) => {

    var text = this.state.text;

    if (event.keyCode===8) {
      text = text.slice(0, -1);
    } else if (event.keyCode>=65 && event.keyCode<=90 && text.length<10){
      text = text.concat(String.fromCharCode(event.keyCode)).toLowerCase();
    }

    this.setState({
      text: text
    });
  }

  handleSubmit = (event) => {

    const onSave = this.props.onSave;

    if (onSave) {
      event.preventDefault();
      onSave(this.state.text);
    }

    this.toggle();
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  // onChange impossible à capter... On se rabat sur onKeyDown.
  render() {
    return (
      <Button onClick={this.toggle} color="light"><FontAwesomeIcon icon={faDownload} />
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Sauvegarder un schéma</ModalHeader>
          <ModalBody>
            <Input type="text" value={this.state.text} onKeyDown={this.handleKeyDown} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.handleSubmit}>Sauvegarder</Button>
            <Button color="secondary" onClick={this.toggle}>Annuler</Button>
          </ModalFooter>
        </Modal>
      </Button>
    );
  }
}
