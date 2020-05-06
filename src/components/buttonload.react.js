import React from 'react';
import { Col, Button, Form, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, CustomInput } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import axios from "axios";

const config = require('../config');

export default class MyButtonLoad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      names: [],
      select: undefined
    };

    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    axios.get("http://" + config.server.host + ":" + config.server.port + "/list")
      .then((response) => {

        console.log(response.data);

        this.setState({
          names: response.data,
          select: response.data[0]
        });
      }, (error) => {
        console.log(error);
      });
  }

  handleSubmit = (event) => {

    const onLoad = this.props.onLoad;

    if (onLoad) {
      event.preventDefault();
      onLoad(this.state.select);
    }

    this.toggle();
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  select(event) {
    this.setState({
      select: event.target.value
    });
  }

  render() {

    const options = this.state.names.map(name => { return(<option onClick={this.select}>{name}</option>) });

    return (
      <Button onClick={this.toggle} color="light"><FontAwesomeIcon icon={faUpload} />
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Charger un schéma</ModalHeader>
          <ModalBody>
            <FormGroup row>
              <Col sm={10}>
                <Input type="select" name="select" id="exampleSelect">
                {options}
                </Input>
              </Col>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.handleSubmit}>Charger</Button>
            <Button color="secondary" onClick={this.toggle}>Annuler</Button>
          </ModalFooter>
        </Modal>
      </Button>
    );
  }
}
