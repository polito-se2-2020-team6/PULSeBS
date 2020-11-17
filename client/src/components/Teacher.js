import React from "react";
import { Col, Container, Row, Tabs, Tab, ListGroup } from "react-bootstrap";

/*  listaLezione -> getLectures 
    corso -> courseId
    lezione -> lectureId
    studenti -> vector of Students
*/

var listaLezioni = [{
    corso: "History",
    lezione: "HY-01",
    studenti: new Array("ettore", "carlo","luca", "camarcorlo")
}, {
    courseId: "History",
    lectureId: "HY-01",
    studenti: new Array("ettore", "carlo","luca", "camarcorlo")
}, {
    courseId: "Geometry",
    lectureId: "GY-01",
    studenti: new Array("ettore", "carlo")
    
}, {
    courseId: "History",
    lectureId: "HY-02",
    studenti: new Array("ettore", "camarcorlo")
}, {
    courseId: "Software Engineering 2",
    lectureId: "SE2-01",
    studenti: []
}, {
    courseId: "Software Engineering 2",
    lectureId: "SE2-02",
    studenti: new Array("Marco","Luca")
}, {
    courseId: "Analisi",
    lectureId: "AI-01",
    studenti: new Array("ludo", "carlo","max")
}]



class Teacher extends React.Component {
    // constructor(props) {
    //   super(props);
  
    //   this.state = {
    //       totalLectures : listaLezioni,
    //       course : listaLezioni[0].courseId,
    //       students : listaLezioni[0].studenti,
    //       lecture : listaLezioni[0].lectureId,
    //   };
    // }

    // getStudentsBooked(){
    //     this.props.studentsBooked();//manda parametro con lectureId
    //     //setta stato studenti presenti alla lezione
    // }

    // deleteLecture(lecture){
    //     this.setState({totalLectures : this.state.totalLectures.filter(c => c.lezione !== lecture)})
    //     //collega all'API

    // };
    
    // render() {
        
    //     const corsi =this.state.totalLectures.map((item) => item.corso ).filter((v,i,s)=> s.indexOf(v) === i ) ;
    // }

    // deleteLecture(lecture){
    //     this.setState({totalLectures : this.state.totalLectures.filter(c => c.lectureId !== lecture)})
    //     //collega all'API
        

    // };
    // clearStudentTable(){
        
    //     this.setState({students: []});
        
    // };
    
    // render() {
        
    //     const corsi =this.state.totalLectures.map((item) => item.courseId ).filter((v,i,s)=> s.indexOf(v) === i ) ;

    //     return (<>
    //         <Container fluid className="mt-5 "> 
            
    //             <Row className="justify-content-md-center" >
    //                 <h1>Welcome back Mario</h1> 
                    
    //             </Row>
    //             <Tabs defaultActiveKey={this.state.totalLectures[0].corso}  id="noanim-tab-example">
    //                 {corsi?.map((C_Id)=> (
    //                      <Tab eventKey={C_Id} title={C_Id} >
    //                          <Row className="mt-5 justify-content-md-center">
    //                          <Col md={4} >
    //                             <Tab.Container id="list-group-tabs-example" >
    //                                 <ListGroup className="mt-5" >
    //                                     {
    //                                         this.state.totalLectures.filter(l => l.corso===C_Id)?.map((c) => (
    //                                                     <ListGroup.Item action active={c.lezione===this.state.lecture} 
    //                                                         onClick={()=> this.setState({students: c.studenti, course: c.corso, lecture: c.lezione})}>
    //                                                         {c.lezione} 
                                                            
    //                                                         <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.lezione)}>

    //             <Tabs defaultActiveKey={this.state.totalLectures[0].courseId}  id="noanim-tab-example" onSelect={() => this.clearStudentTable()}>
    //                 {corsi?.map((C_Id)=> (
    //                      <Tab eventKey={C_Id} title={C_Id} >
    //                          <Row className="mt-5 ">
    //                         <Col md={1}></Col>
    //                          <Col md={4} >
    //                             <Tab.Container id="list-group-tabs-example" >
    //                                 <ListGroup className="mt-2" >
    //                                 <ListGroup.Item as="li"  active > 
    //                                     <h3>lecture</h3>
    //                                 </ListGroup.Item>

    //                                     {
    //                                         this.state.totalLectures.filter(l => l.courseId===C_Id)?.map((c) => (
    //                                                     <ListGroup.Item action variant={c.lectureId===this.state.lecture? "primary": "light"} 
    //                                                         onClick={()=> this.setState({students: c.studenti, course: c.courseId, lecture: c.lectureId})}>
    //                                                         {c.lectureId} 
                                                            
    //                                                         <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.lectureId)}>

    //                                                             <span aria-hidden="true">&times;</span>
    //                                                         </button>
    //                                                     </ListGroup.Item>
    //                                         ))}
    //                                 </ListGroup>
    //                             </Tab.Container>
    //                         </Col>
    //                         <Col md={1}></Col>
    //                         <Col md={4}>
    //                             <ListGroup as="ul" className="mt-2">
    //                             <ListGroup as="ul" className="mt-2">
    //                                 <ListGroup.Item as="li" active>
    //                                     <h3>students booked</h3>
    //                                 </ListGroup.Item>
                                    
    //                                     {this.state.students.map((s)=> (
    //                                         <ListGroup.Item as="li">{s} 
                                                
    //                                         </ListGroup.Item>
    //                                     )
    //                                     )}
                                    
    //                             </ListGroup>
    //                         </Col> 
    //                          </Row>
    //                      </Tab>
    //                 )
                    
    //                 )}
    //             </Tabs>
    //         </Container>
    //     </>);
    // }
}


function funct_Student(courseId){
    this.setState({course : courseId.courseId , students : courseId.studenti });
}

export default Teacher;