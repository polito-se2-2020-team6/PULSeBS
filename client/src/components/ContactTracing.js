import React from "react";
import { Container, Jumbotron } from "react-bootstrap";
import PositiveStudentModal from "../components/PositiveStudentModal";
import { withStyles } from "@material-ui/core/styles";
import { Grid, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import { Alert, AlertTitle } from "@material-ui/lab";
import API from "../API/API";

const styles = {
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  paper: {
    textAlign: "center",
  },
};

const options = [
  { title: "Student Number - (SN)", value: "id" },
  { title: "Servizio Sanitario Nazionale - (SSN)", value: "ssn" },
];

class ContactTracing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: options[0], // contains the options related to ComboBOX
      number: "", // contains the SSN or SID
      positiveSTD: "", // should set to "" for working conditional rendering
      isModalOpen: false, // for contolling the Modal
      err: false, // turns the border of text input to red, once there is only digits
    };
  }

  //----------------------- a function to handle the vlaue of SSN or SID of comboBOX
  changeHandler = async (e, newValue) => {
    if (newValue !== null) {
      console.log(newValue.value);
      await this.setState({
        value: newValue,
        err: false,
        positiveSTD: "",
      });
    } else {
      await this.setState({
        value: "",
      });
    }
  };

  //----------------------- a function to get the vlaue of SSN or SID of inputBOX
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  //----------------------- a function to handle the button send and open MODAL, but before that, some check reuires -->
  //regex only dogot is here

  sendHandle = async () => {
    // console.log(this.state.value.value);
    console.log(this.state.number);
    if (this.state.value.value === "id") {
      await API.getPositiveStudentDetail(
        this.state.number,
        null,
        "id",
        null
      ).then((response) => {
        // console.log(response);
        this.setState({
          positiveSTD: response,
          err: false,
        });
      });
      if (this.state.positiveSTD.success) {
        this.toggleModal();
      }
      console.log(this.state.positiveSTD);
    } else if (this.state.value.value === "ssn") {
      if (/^\d+$/.test(this.state.number)) {
        this.setState({ err: true });
      } else {
        await API.getPositiveStudentDetail(
          null,
          this.state.number.toString(),
          null,
          "ssn"
        ).then((response) => {
          // console.log(response);
          this.setState({
            positiveSTD: response,
            err: false,
          });
        });
      }
      if (this.state.positiveSTD.success) {
        this.toggleModal();
      }
      console.log(this.state.positiveSTD);
    }
  };

  // fumction to control the MODAL
  toggleModal = async () => {
    await this.setState({
      isModalOpen: !this.state.isModalOpen,
    });
  };

  render() {
    const actionClasses = this.props.classes;
    return (
      <>
        <Jumbotron fluid>
          <Container>
            <h1>Contact Tracing Report</h1>
            <p>
              A page for reporting the positive students to comply with safety
              regulations.
            </p>
          </Container>
        </Jumbotron>

        <Grid
          className={actionClasses.root}
          container
          alignItems="center"
          justify="center"
          wrap="nowrap"
        >
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            {/* <Autocomplete
                value={this.state.value}
                inputValue={this.state.inputValue}
                id="size-small-standard"
                // size="small"
                options={options}
                getOptionLabel={(option) => option.title}
                onChange={(e, newValue) => this.changeHandler(e, newValue)}
                onInputChange={(e, newInputvalue) =>
                  this.onInputChangeHandler(e, newInputvalue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Search By"
                    placeholder=""
                  />
                )}
              /> */}
            <Autocomplete
              value={this.state.value}
              onChange={(e, newValue) => this.changeHandler(e, newValue)}
              id="combo-box-demo"
              options={options}
              getOptionLabel={(option) => (option ? option.title : "")}
              // style={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Search By" />
              )}
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4} style={{ marginTop: "15px" }}>
            <TextField
              error={this.state.err} // a filed to red the border once there is error
              onChange={this.handleInputChange}
              id="number"
              name="number"
              disabled={!this.state.value} // disable when there is no value
              value={this.state.number}
              fullWidth
              id="standard-basic"
              label={
                this.state.value.title
                  ? `Enter ${this.state.value.title}`
                  : "Please Select SSN or SN"
              }
            />
          </Grid>
          <Grid item xs={4}></Grid>

          <Grid item xs={4} style={{ marginTop: "80px" }}>
            <Button
              disabled={!this.state.value} // disable when there is no value
              fullWidth
              variant="contained"
              color="primary"
              onClick={this.sendHandle}
            >
              Send
            </Button>
          </Grid>
        </Grid>
        {this.state.positiveSTD &&
          this.state.isModalOpen && ( // if the API returns value correctly and MODAL is OK--- >openMODAL
            <>
              <PositiveStudentModal
                isModalOpen={this.state.isModalOpen}
                toggleModal={this.toggleModal}
                positiveSTD={this.state.positiveSTD}
              />
            </>
          )}
        <Grid style={{ marginTop: "30px" }} container>
          <Grid item xs={2}></Grid>
          <Grid item xs={8}>
            {this.state.positiveSTD.success === false && ( // if the API returns no value, user does not enter correct SSN|SID this error appears
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {this.state.positiveSTD.reason} {"\u00A0"}
                <strong>Check the SSN or SN</strong>
              </Alert>
            )}
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles)(ContactTracing);
