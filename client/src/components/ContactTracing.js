import React from "react";
import { Container, Jumbotron } from "react-bootstrap";
// import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import { Grid, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
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
      value: options[0],
      number: "",
      positiveSTD: "", // should set to "" for working conditional rendering
      // inputValue: options[0].value,
    };
  }

  // onInputChangeHandler = async (e, newInputvalue) => {
  //   if (newInputvalue === "") {
  //     await this.setState({
  //       inputValue: "",
  //     });
  //   }
  //   console.log(newInputvalue);
  //   await this.setState({
  //     inputValue: newInputvalue,
  //   });
  // };
  changeHandler = async (e, newValue) => {
    if (newValue !== null) {
      console.log(newValue.value);
      await this.setState({
        value: newValue,
      });
    } else {
      await this.setState({
        value: "",
      });
    }
  };
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };
  sendHandle = async () => {
    // console.log(this.state.value.value);
    // console.log(this.state.number);
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
        });
      });
      console.log(this.state.positiveSTD.firstname);
    }
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
            {/* <form
              className={actionClasses.root}
              autoComplete="off"
              // variant="filled"
              fullWidth
            > */}
            <TextField
              onChange={this.handleInputChange}
              id="number"
              name="number"
              disabled={!this.state.value}
              value={this.state.number}
              fullWidth
              id="standard-basic"
              label={
                this.state.value.title
                  ? `Enter ${this.state.value.title}`
                  : "Please Select SSN or SN"
              }
            />
            {/* <TextField id="filled-basic" label="Filled" variant="filled" /> */}
            {/* <TextField
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
              /> */}
            {/* </form> */}
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4} style={{ marginTop: "50px" }}>
            <Button
              disabled={!this.state.value}
              fullWidth
              variant="contained"
              color="primary"
              onClick={this.sendHandle}
            >
              Send
            </Button>
          </Grid>
        </Grid>
        {this.state.positiveSTD ? <p>salam</p> : <></>}
      </>
    );
  }
}

export default withStyles(styles)(ContactTracing);
