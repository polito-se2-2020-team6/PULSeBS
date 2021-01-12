import React from "react";
import { Button, Grid, TextField, Typography } from "@material-ui/core";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import API from "../API/API";

const theme = createMuiTheme({
  typography: {
    fontSize: 13,
    allVariants: {
      // color: "#1e4f80",
    },
  },
});

const options = [
  { title: "PDF", value: "pdf" },
  { title: "CSV", value: "csv" },
];

class PositiveStudentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      value: "",
    };
    // this.toggle = this.toggle.bind(this);
  }

  changeHandler = async (e, newValue) => {
    if (newValue !== null) {
      console.log(newValue.value);
      await this.setState({
        value: newValue,
      });
    }
    // else {
    //   await this.setState({
    //     value: "",
    //   });
    // }
  };

  generateReport = () => {
    API.getCTReport(this.props.positiveSTD.userId, this.state.value.value);
  };

  render() {
    const student = this.props.positiveSTD;
    return (
      <div>
        <Modal
          id="modalPOS"
          toggle={this.props.toggleModal}
          isOpen={this.props.isModalOpen}
        >
          <ModalHeader toggle={this.props.toggleModal}>
            <Typography style={{ color: "#15007e" }} variant="h4">
              Detail of Positive Student to Report
            </Typography>
          </ModalHeader>
          <ModalBody>
            <ThemeProvider theme={theme}>
              <Grid alignItems="center" justify="center" wrap="nowrap">
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>Student ID: </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.userId}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>Firstname: </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.firstname}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>Lastname: </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.lastname}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </Grid>
              {student.birthday ? (
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>Birthday: </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.birthday}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              ) : (
                <></>
              )}
              {student.SSN ? (
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>SSN:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.SSN}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              ) : (
                <></>
              )}
              {student.city ? (
                <Grid container xs={12}>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Typography>City:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{student.city}</Typography>
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              ) : (
                <></>
              )}
              <Grid container xs={12}>
                <Grid item xs={2}></Grid>
                <Grid item xs={2}>
                  <Typography>Email: </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>{student.email}</Typography>
                </Grid>
                <Grid item xs={6}></Grid>
              </Grid>
              <Grid style={{ marginTop: "30px" }} container xs={12}>
                <Grid item xs={2}></Grid>
                <Grid xs={10} item>
                  <Typography>
                    Select the filte types to generate the report
                  </Typography>
                </Grid>
              </Grid>
              <Grid container xs={12}>
                <Grid item xs={2}></Grid>
                <Grid item xs={8}>
                  <Autocomplete
                    value={this.state.value}
                    onChange={(e, newValue) => this.changeHandler(e, newValue)}
                    id="typeCombo"
                    options={options}
                    getOptionLabel={(option) => (option ? option.title : "")}
                    renderInput={(params) => (
                      <TextField {...params} label="Type of file" />
                    )}
                  />
                </Grid>
              </Grid>
            </ThemeProvider>
          </ModalBody>
          <ModalFooter>
            <Grid alignItems="center" justify="center" container xs={12}>
              <Button
                disabled={!this.state.value}
                variant="contained"
                color="secondary"
                onClick={this.generateReport}
                id="generate"
              >
                Generate
              </Button>
              <Grid item xs={2}></Grid>
              <Button
                id="cancel"
                variant="outlined"
                color="secondary"
                onClick={this.props.toggleModal}
              >
                Cancel
              </Button>
            </Grid>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
export default PositiveStudentModal;
