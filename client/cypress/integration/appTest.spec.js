import "cypress-file-upload";
const baseURL = "http://localhost:3000";

// context("loginAPITest", () => {
//   it("returns User", () => {
//     cy.request({
//       method: "POST",
//       url: `http://localhost:8080/API/REST.php/api/login`,
//       form: true,
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: {
//         username: "mostafat",
//         password: "helloworld",
//       },
//     }).then((response) => {
//       const status = JSON.parse(JSON.stringify(response.body));
//       expect(status).to.have.property("success", true);
//       expect(status).to.have.property("userId", "5");
//       expect(status).to.have.property("type", 0);
//     });
//   });
// });

// context("Home Page", () => {
//   it("Login Page Test", () => {
//     cy.visit(baseURL);
//     cy.focused().should("have.attr", "name", "username");
//     cy.get("#title").should(
//       "have.text",
//       "Pandemic University Lecture Seat Booking System (PULSeBS)"
//     );
//     cy.get("#loginTitle").should("have.id", "loginTitle");
//     cy.get("#password").should("have.attr", "name", "password");
//     cy.get("#login").should("have.attr", "type", "submit");
//   });
// });

// context("Student Page", () => {
//   it("Login Test for Student Component", () => {
//     cy.visit(baseURL);
//     cy.get("#username").type("mostafat");
//     cy.get("#password").type("helloworld");
//     cy.get("#login").click();
//     cy.url().should("include", "/student/home");
//     cy.get("h1").should("have.text", "Book Your Next Lectures");
//     cy.get("#dropdown-filter").click();
//     cy.get("#filter-items").first().should("have.text", "All Courses").click();
//     cy.get("#booked-lecture").should("have.text", "Booked Lectures").click();
//     cy.get("#avail-lecture").should("be.visible");
//     cy.get("#book-a-seat").should("be.visible");
//     cy.wait(500);
//     cy.get("#booked").should("be.visible");
//     cy.get("#calendar").click();
//     cy.url().should("include", "/student/calendar?userid=5");
//     cy.get("#logout").click();
//   });
// });

// context("Teacher Page", () => {
//   it("Login Test for Teacher Component", () => {
//     cy.visit(baseURL);
//     cy.get("#username").type("antoniov");
//     cy.get("#password").type("987654321");
//     cy.get("#login").click();
//     cy.url().should("include", "/teacher/home");
//     cy.get("#welcome")
//       .should("be.visible")
//       .should("have.text", "Welcome back Antonio Vetrò");
//     cy.get("#lgId2").should("be.visible");
//     cy.get("#but4").should("have.text", "Turn to online").click();
//     cy.get("#modId1").should("be.visible");
//     cy.get("#but5").should("be.visible").click();
//     cy.get("#but1").should("have.text", "Delete").click();
//     cy.get("#modId").should("be.visible");
//     cy.get("#but2").should("be.visible").click();
//     cy.get(".tab-content").should("be.visible");
//     cy.get("#historicaldata").click();
//     cy.url().should("include", "/teacher/historicaldata");
//     cy.get("#dropdown-basic").should("be.visible");
//     cy.get("#dropdown-basic").click();
//     cy.get("#d1").click();
//     cy.get("#tabIdd");
//     cy.get("thead>tr").eq(0).should("have.text", "LectureAverage bookings");
//     cy.get("tbody>tr").eq(0);
//     cy.get("tr>td")
//       .eq(0)
//       .should("be.visible")
//       .contains("Information Systems Security");
//     cy.get("tr>td").eq(1).should("be.visible").contains("0");
//     cy.get("#dropdown-basic").click();
//     cy.get("#d2").click();
//     cy.get("#dropdown-basic1")
//       .should("be.visible")
//       .should("have.text", "Information Systems Security");

//     cy.get("#logout").click();
//   });
// });

context("Support Officer Page", () => {
  it("Login Test for Support Officer Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("suppofr");
    cy.get("#password").type("passw1");
    cy.get("#login").click();
    cy.url().should("include", "/support/home");
    cy.get(".tab-content").should("be.visible");
    const fileName = "Students.csv";

    cy.readFile(
      "/home/asus/myWork/PULSeBS/client/src/data/csv-files/Students.csv"
    ).then(function (fileContent) {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: "application/csv",
      });
      cy.get("#uploadBTN").click();
      cy.get("#uploadSucc").should("be.visible");
    });
  });
});

// context("Booking Manager Page", () => {
//   it("Automated test for Booking Manager Component", () => {
//     cy.visit(baseURL);
//     cy.get("#username").type("boookman");
//     cy.get("#password").type("123123123");
//     cy.get("#login").click();
//     cy.url().should("include", "/booking-manager/home");
//     cy.get("#welcomeText")
//       .should("be.visible")
//       .should("have.text", "Welcome Mr.");
//     // cy.get("#course").select("ALL Courses").should("have.value", "0");
//     cy.get("#teachersTable").should("be.visible");
//     cy.get("#course").click();
//     cy.get("li")
//       .first()
//       .should("have.value", 0)
//       .should("have.text", "ALL Courses")
//       .click();
//     cy.get("#filter").click();
//     cy.get("li")
//       .first()
//       .should("have.value", 0)
//       .should("have.text", "Total Statistics")
//       .click();
//     cy.get("#statisticsTable").should("be.visible");
//     cy.get("#filter").click();
//     cy.get("li")
//       .eq(1)
//       .should("have.value", 0)
//       .should("have.text", "Weekly Statistics")
//       .click();
//     cy.get("#weeklyChart").should("be.visible");
//     cy.get("#filter").click();
//     cy.get("li")
//       .eq(2)
//       .should("have.value", 0)
//       .should("have.text", "Monthly Statistics")
//       .click();
//     cy.get(".react-datepicker").should("be.visible");
//     cy.get(".react-datepicker__month-11").click();
//     cy.get("#monthlyChart").should("be.visible");
//   });
// });
