import React from 'react';
import { Input, Container, Table, Dimmer, Modal, Header, Button, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'

class App extends React.Component {


  constructor() {
    super()
    // get lastsearch and history from local storage
    const lastSearch = localStorage.getItem("ipAddress");
    const searches = localStorage.getItem("searches");


    this.state = {
      ipAddress: lastSearch ? lastSearch : "",
      loading: false, // making fetch
      searches: searches ? JSON.parse(searches) : [],
      error: "", // when some error appears
      delete: 0 //delete ip
    }

    this.inputChange = this.inputChange.bind(this)
    this.goSearch = this.goSearch.bind(this)
  }

  // Input change
  inputChange(event) {
    // Set IpAddress in state
    this.setState({ ipAddress: event.target.value });
    // Save IpAddress in local storage
    localStorage.setItem("ipAddress", event.target.value);
  }

  //deleting ip from history
  deleteItem() {
    const ip = this.state.delete;
    // look if we've got the ip in the list
    const index = this.state.searches.findIndex(search => search.ip == ip)

    if (index > -1) {
      const searches = [...this.state.searches.slice(0, index), ...this.state.searches.slice(index + 1)];

      //saving to state and to localstorage
      this.setState({ searches, delete: 0 });
      localStorage.setItem("searches", JSON.stringify(searches));
    }
  }

  goSearch() {
    //stop if there is already an ajax request
    if (this.state.loading)
      return;

    //test if email is Valid
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(this.state.ipAddress.trim())) {
      if (this.state.searches.findIndex(a => a.ip == this.state.ipAddress.trim()) != -1) {
        this.setState({ error: "Ip address is allready searched and is in the table bellow" })
        return;
      }

      //if valid do ajax request
      this.setState({ loading: true });

      fetch("https://api.2ip.ua/geo.json?ip=" + this.state.ipAddress.trim()).then(response => response.json()).then(json => {
        //saving the response
        const searches = [json, ...this.state.searches];
        localStorage.setItem("searches", JSON.stringify(searches))
        this.setState({ loading: false, searches })

      })
        // There could be errors in the backend so this is a necesity
        .catch(e => this.setState({ error: "Something went wrong!", loading: false }))
    }
    else {
      //show error in modal to user by changing error state
      this.setState({ error: "Ip Address is not valid" })

    }
  }

  render() {
    return (
      <Container>
        <Dimmer active={this.state.loading}>Loading</Dimmer>
        <h3>Please Enter and IP4 address</h3>

        {/*  input to search start */}
        <Input fluid action={{ icon: "globe", content: "Search", onClick: () => this.goSearch() }} value={this.state.ipAddress} onKeyDown={(e) => {
          if (e.key == "Enter") {
            this.goSearch()
          }
        }} onChange={this.inputChange} />
        {/*  input to search end */}


        {/*  history table start */}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>IP Address</Table.HeaderCell>
              <Table.HeaderCell>Country</Table.HeaderCell>
              <Table.HeaderCell>Region</Table.HeaderCell>
              <Table.HeaderCell>City</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.state.searches.map((search, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{search.ip}</Table.Cell>
                    <Table.Cell>{search.country}</Table.Cell>
                    <Table.Cell>{search.region}</Table.Cell>
                    <Table.Cell>{search.city}</Table.Cell>
                    <Table.Cell collapsing>

                      {/*  delete an item from history */}
                      <Button color="red" onClick={() => this.setState({ delete: search.ip })}>Delete</Button></Table.Cell>
                  </Table.Row>
                )
              })
            }
          </Table.Body>
        </Table>
        {/*  input to search end */}


        {/*  error modal start */}
        <Modal
          open={this.state.error != ""}
          onClose={() => this.setState({ error: "" })}
          basic
          size='small'
        >
          <Header icon='info' content='Error' />
          <Modal.Content>
            <h3>{this.state.error}</h3>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' onClick={() => this.setState({ error: "" })} inverted>
              <Icon name='checkmark' /> Understood
          </Button>
          </Modal.Actions>
        </Modal>
        {/* error modal end */}

        {/* delete modal start */}
        <Modal size='mini' open={this.state.delete != 0} onClose={() => this.setState({ delete: 0 })}>
          <Modal.Header>Delete ip?</Modal.Header>
          <Modal.Content>
            <p>Are you sure you want to delete this item</p>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={() => this.setState({ delete: 0 })}>No</Button>
            <Button positive icon='checkmark' labelPosition='right' onClick={() => {
              this.deleteItem()
            }} content='Yes' />
          </Modal.Actions>
        </Modal>

        {/*  delete modal end */}

      </Container>

    )
  }
}

export default App;