const baseURL = "http://localhost:3000";

context("loginAPITest", () => {
  it("returns User", () => {
    cy.request({
      method: "POST",
      url: `http://localhost:8080/API/REST.php/api/login`,
      form: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: {
        username: "mostafat",
        password: "helloworld",
      },
    }).then((response) => {
      const status = JSON.parse(JSON.stringify(response.body));
      expect(status).to.have.property("success", true);
      expect(status).to.have.property("userId", "5");
      expect(status).to.have.property("type", "0");
    });
  });
});

context("Home Page", () => {
  it("Login Page Test", () => {
    cy.visit(baseURL);
    cy.focused().should("have.attr", "name", "username");
    cy.get("#title").should(
      "have.text",
      "Pandemic University Lecture Seat Booking System (PULSeBS)"
    );
    cy.get("#loginTitle").should("have.id", "loginTitle");
    cy.get("#password").should("have.attr", "name", "password");
    cy.get("#login").should("have.attr", "type", "submit");
  });
});

context("Student Page", () => {
  it("Login Test for Student Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("mostafat");
    cy.get("#password").type("helloworld");
    cy.get("#login").click();
    cy.url().should("include", "/student/home");
    cy.get("h1").should("have.text", "Book Your Next Lectures");
    cy.get("#calendar").click();
    cy.url().should("include", "/student/calendar");
    cy.get("#logout").click();
  });
});

context("Teacher Page", () => {
  it("Login Test for Teacher Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("marcot");
    cy.get("#password").type("passw1");
    cy.get("#login").click();
    cy.url().should("include", "/teacher/home");
    cy.get(".tab-content").should("be.visible");
    cy.get("#historicaldata").click();
    cy.url().should("include", "/teacher/historicaldata");
    cy.get("#dropdown-basic").should("be.visible");
    cy.get("#logout").click();
  });
});

context("ُSupport Officer Page", () => {
  it("Login Test for Support Officer Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("suppofr");
    cy.get("#password").type("passw1");
    cy.get("#login").click();
    cy.url().should("include", "/support/home");
    cy.get(".tab-content").should("be.visible");
    // cy.get("#historicaldata").click();
    // cy.url().should("include", "/teacher/historicaldata");
    // cy.get("#dropdown-basic").should("be.visible");
    // cy.get("#logout").click();
  });
});

context("Booking Manager Page", () => {
  it("Automated test for Booking Manager Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("boookman");
    cy.get("#password").type("123123123");
    cy.get("#login").click();
    cy.url().should("include", "/booking-manager/home");
    cy.get("#welcomeText")
      .should("be.visible")
      .should("have.text", "Welcome Mr.");
    // cy.get("#course").select("ALL Courses").should("have.value", "0");
    cy.get("#teachersTable").should("be.visible");
    cy.get("#course").click();
    cy.get("li")
      .first()
      .should("have.value", 0)
      .should("have.text", "ALL Courses")
      .click();
    cy.get("#filter").click();
    cy.get("li")
      .first()
      .should("have.value", 0)
      .should("have.text", "Total Statistics")
      .click();
    cy.get("#pie").should("be.visible");
    cy.get("#filter").click();
    cy.get("li")
      .eq(1)
      .should("have.value", 0)
      .should("have.text", "Weekly Statistics")
      .click();
    cy.get("#weeklyChart").should("be.visible");
    cy.get("#filter").click();
    cy.get("li")
      .eq(2)
      .should("have.value", 0)
      .should("have.text", "Monthly Statistics")
      .click();
    cy.get(".react-datepicker").should("be.visible");
    cy.get(".react-datepicker__month-11").click();
    cy.get("#monthlyChart").should("be.visible");
  });
});
