import "cypress-file-upload";
const baseURL = "http://localhost:3000";

const studentLogin = () => {
  cy.visit(baseURL);
  cy.get("#username").type("mostafat");
  cy.get("#password").type("helloworld");
  cy.get("#login").click();
  cy.url().should("include", "/student/home");
};

const studentNotLogin = () => {
  cy.visit(baseURL);
  cy.get("#username").type("mostafa");
  cy.get("#password").type("helloworld");
  cy.get("#login").click();
  // cy.url().should("include", "/student/home");
  cy.get(".Toastify__toast-body")
    .should("be.visible")
    .should("have.text", "Sorry, the username or password was incorrect.");
};

const professorLogin = () => {
  cy.visit(baseURL);
  cy.get("#username").type("antoniov");
  cy.get("#password").type("987654321");
  cy.get("#login").click();
  cy.url().should("include", "/teacher/home");
};

const isLogged = () => {
  // console.log("df");
  it("returns JSON", () => {
    cy.request("GET", "http://localhost:8080/API/REST.php/api/user/me").then(
      (response) => {
        const status = JSON.parse(JSON.stringify(response.body));
        console.log(status);
        expect(status).to.have.property("success", false);
      }
    );
  });
};

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
      expect(status).to.have.property("type", 0);
    });
  });
});

context("loginAPITest", () => {
  it("returns User", () => {
    cy.request({
      failOnStatusCode: false,
      url: `http://localhost:8080/API/REST.php/api/user/me`,
    }).then((response) => {
      const status = JSON.parse(JSON.stringify(response.body));
      expect(status).to.have.property("reason", "Authentication required");
      expect(status).to.have.property("success", false);
      console.log(response.status === 403);
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
    studentNotLogin();
    studentLogin();
    cy.get("h1").should("have.text", "Book Your Next Lectures");
    cy.get("#dropdown-filter").click();
    cy.get("#filter-items").first().should("have.text", "All Courses").click();
    cy.get("tbody>tr").eq(10).find("button").click();

    cy.get("#booked-lecture").should("have.text", "Booked Lectures").click();
    cy.get("#avail-lecture").should("be.visible");
    cy.get("#book-a-seat").should("be.visible");
    cy.wait(16000);
    cy.get("#booked>tbody>tr").eq(0).find("button").click();
    cy.get("#calendar").contains("Calendar").click();
    cy.url().should("include", "/student/calendar?userid=5");
    cy.get("#logout").click();
  });
});

context("Teacher Page", () => {
  it("Login Test for Teacher Component", () => {
    professorLogin();
    const response = isLogged();
    // console.log(response);
    cy.get("#welcome")
      .should("be.visible")
      .should("have.text", "Welcome back Antonio Vetrò");
    cy.get("#lgId2").should("be.visible");
    cy.get("#pagNextId").click();
    cy.get("#pagPrevId").click();
    // test Trun To Online BTN in Teacher Page - "No" BTN in POPUP
    cy.get("#but4").should("have.text", "Turn to online").click();
    cy.get("#modId1").should("be.visible");
    cy.get("#but5").should("have.text", "No").should("be.visible").click();
    // test Trun To Online BTN in Teacher Page - "Yes,I am BTN" BTN in POPUP
    cy.get("#but4").should("have.text", "Turn to online").click();
    cy.get("#modId1").should("be.visible");
    cy.get("#but6")
      .should("have.text", "Yes, I am")
      .should("be.visible")
      .click();
    // test Delete BTN in Teacher Page - "No" BTN in POPUP
    cy.get("#but1").should("have.text", "Delete").click();
    cy.get("#modId").should("be.visible");
    cy.get("#but2").should("have.text", "No").should("be.visible").click();
    // test Delete BTN in Teacher Page - "Yes,I am BTN" in POPUP
    cy.get("#but1").should("have.text", "Delete").click();
    cy.get("#modId").should("be.visible");
    cy.get("#but3")
      .should("have.text", "Yes, I am")
      .should("be.visible")
      .click();
    // Test historicaldata Component------------------------------------
    cy.get(".tab-content").should("be.visible");
    cy.get("#historicaldata").click();
    cy.url().should("include", "/teacher/historicaldata");
    cy.get("#dropdown-basic").should("be.visible");
    cy.get("#dropdown-basic").click();
    cy.get("#d1").click();
    cy.get("#tabIdd");
    cy.get("thead>tr").eq(0).should("have.text", "LectureBookings");
    cy.get("tbody>tr").eq(0);
    cy.get("tr>td").eq(0).should("be.visible").contains("Information");
    // cy.get("tr>td").eq(1).should("be.visible").contains("");

    //DD bookings
    cy.get("#dropdown-basic3").click();
    cy.get("#d1").click();
    cy.get("#dropdown-basic3").click();
    cy.get("#d2").click();

    // DD
    cy.get("tr>td").eq(0).should("be.visible").contains("Human");
    cy.get("tr>td").eq(1).should("be.visible").contains("0");
    cy.get("#dropdown-basic").click();
    cy.get("#d2").click();
    cy.get("#dropdown-basic1")
      .should("be.visible")
      .should("have.text", "Information Systems Security");
    // Test RecordPresence Component------------------------------------
    cy.get("#recordPresence").click();
    cy.url().should("include", "/teacher/recordPresence");
    cy.get("#acc").should("be.visible");
    cy.get("#acc1").click();
    cy.get("#logout").click();
  });
});

context("Support Officer Page", () => {
  it("Login Test for Support Officer Component", () => {
    cy.visit(baseURL);
    cy.get("#username").type("suppofr");
    cy.get("#password").type("passw1");
    cy.get("#login").click();
    cy.url().should("include", "/support/home");
    cy.get(".tab-content").should("be.visible");
    cy.get("#uploadBTN").click();
    cy.get("#selectError").should("be.visible");

    // TEST UPLOAD FILES STUDENTS --------------------------

    const fileName = "Students.csv";
    cy.readFile(
      "C:\\Users\\ASUS\\Desktop\\NewNewSE2\\PULSeBS\\client\\src\\data\\csv-files\\Students.csv"
    ).then(function (fileContent) {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: "application/csv",
      });
      cy.get("#uploadBTN").click();
      cy.get("#uploadSucc").should("be.visible");
      cy.get("#uploadBTN").click();
      cy.get("#uploadFail").should("be.visible");
    });

    cy.get("#uncontrolled-tab-example-tab-teachers", { force: true }).click();
    cy.get("#uploadBTN").should("have.text", "Upload").click({ force: true });

    // Test UpdateList COmponent ---------------------------------------
    cy.get("#supportupdate").click();
    cy.url().should("include", "/support/update");
    cy.get("#DropD1").click(); // year DD
    cy.get(".dropdown-item").eq(1).should("have.text", "1").click();
    cy.get("#Dropdw2").click(); // year DD
    cy.get(".dropdown-item")
      .last()

      .click();
    cy.get("#ButU9").click(); // btn insert date
    // cy.get("#start").should("be.visible");
    // cy.get("#end").should("be.visible");

    cy.get("#but4").click(); // update BTN
    cy.get("#modId2").should("be.visible");

    cy.get("#but6").should("be.visible").click(); // yes modal

    // Test EditLecture COmponent ---------------------------------------
    cy.get("#supportschedule").click();
    cy.url().should("include", "/support/schedule");
    cy.get("#course-title").should("be.visible").click();
    cy.get("#edit-lecture").click();
    cy.get("#day").select("Tuesday");
    cy.get("#time").type("11:30");
    cy.get("#startDate").type("2021-03-15");
    cy.get("#endDate").type("2021-03-25");
    cy.get("#1").click();
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
    cy.get("#statisticsTable").should("be.visible");
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
    // ************************************ Test Contact Tracing and Positive Student Modal Components **********************************
    cy.get("#CT").click();
    cy.url().should("include", "/booking-manager/contact-tracing");
    cy.get("#JT")
      .should("be.visible")
      .should(
        "have.text",
        "Contact Tracing ReportA page for reporting the positive students to comply with safety regulations."
      );
    cy.get('[title="Clear"]').click({ force: true });
    cy.get("#btnSEND").should("have.value", "").should("be.disabled");
    cy.get("#number").should("have.value", "").should("be.disabled");
    cy.get("#search-by").should("be.visible").click({ force: true });
    cy.get("li")
      .first()
      .should("have.value", 0)
      .should("have.text", "Student Number - (SN)")
      .click();
    cy.get("#number").type(5);
    cy.get("#btnSEND").click();
    cy.get("#modalPOS").should("be.visible");
    cy.get("#typeCombo").should("be.visible").click();
    cy.get("li")
      .first()
      .should("have.value", 0)
      .should("have.text", "PDF")
      .click();
    cy.get("#generate").click();
    cy.get("#typeCombo").click();
    cy.get("li")
      .eq(1)
      .should("have.value", 0)
      .should("have.text", "CSV")
      .click();
    cy.get("#generate").click();
    cy.get("#cancel").click();
    cy.get("#search-by").click();
    cy.get("li")
      .eq(1)
      .should("have.value", 0)
      .should("have.text", "Social Security Number - (SSN)")
      .click();
    cy.get("#number").clear();
    cy.get("#number").type("AB123456789");
    cy.get("#btnSEND").click();
    cy.get("#modalPOS").should("be.visible");
    cy.get("#cancel").click();
    cy.get("#number").clear();
    cy.get("#btnSEND").click();
  });
});
