$(document).ready(function () {
  const credentials = btoa("coalition:skills-test");
  $.ajax({
    url: "https://fedskillstest.coalitiontechnologies.workers.dev",
    method: "GET",
    headers: {
      Authorization: "Basic " + credentials,
    },
    success: function (data) {
      console.log(data);

      function populatePatientData(patient) {
        // Populate patient info
        $(".profile-picture").attr("src", patient.profile_picture);
        $(".patient-name").text(patient.name);
        $(".dob-value").text(patient.date_of_birth);
        $(".gender-value").text(patient.gender);
        $(".contact-value").text(patient.phone_number);
        $(".emergency-contact-value").text(patient.emergency_contact);
        $(".insurance-value").text(patient.insurance_type);

        // Populate lab results
        const labResultsDetails = $(".lab-results-details");
        labResultsDetails.empty();
        patient.lab_results.forEach((result) => {
          labResultsDetails.append(`
            <div class="item">
              <span>${result}</span>
              <img
                src="assets/download_FILL0_wght300_GRAD0_opsz24 (1).svg"
                alt="Download"
                height="20"
              />
            </div>
          `);
        });

        // Prepare data for charts
        const monthNames = {
          January: "Jan",
          February: "Feb",
          March: "Mar",
          April: "Apr",
          May: "May",
          June: "Jun",
          July: "Jul",
          August: "Aug",
          September: "Sep",
          October: "Oct",
          November: "Nov",
          December: "Dec",
        };
        const diagnosisHistory = patient.diagnosis_history.sort((a, b) => {
          const dateA = new Date(`${a.month} 1, ${a.year}`);
          const dateB = new Date(`${b.month} 1, ${b.year}`);
          return dateA - dateB;
        });

        // Filter the dataset to include only the specified months
        const filteredHistory = diagnosisHistory.filter((entry) =>
          [
            "October 2023",
            "November 2023",
            "December 2023",
            "January 2024",
            "February 2024",
            "March 2024",
          ].includes(`${entry.month} ${entry.year}`)
        );

        const months = filteredHistory.map(
          (entry) => `${monthNames[entry.month]}, ${entry.year}`
        );
        const systolicData = filteredHistory.map(
          (entry) => entry.blood_pressure.systolic.value
        );
        const diastolicData = filteredHistory.map(
          (entry) => entry.blood_pressure.diastolic.value
        );

        // Calculate max value for systolic and min value for diastolic
        const maxSystolic = Math.max(...systolicData);
        const minDiastolic = Math.min(...diastolicData);

        // values for y-axis
        const allValues = [...systolicData, ...diastolicData];
        const minYValue = Math.floor(Math.min(...allValues) / 20) * 20;
        const maxYValue = Math.ceil(Math.max(...allValues) / 20) * 20;

        const ctx = $("#diagnosisHistoryChart");
        // line chart options
        var options = {
          chart: {
            type: "line",
            height: 200,
            toolbar: {
              show: false,
            },
          },
          series: [
            {
              name: "Systolic Blood Pressure",
              data: systolicData,
            },
            {
              name: "Diastolic Blood Pressure",
              data: diastolicData,
            },
          ],
          xaxis: {
            categories: months,
            labels: {
              show: true,
              style: {
                font: "normal normal normal 12px/17px Manrope",
                colors: "#072635",
              },
            },
          },
          yaxis: {
            min: minYValue,
            max: maxYValue,
            labels: {
              show: true,
              style: {
                font: "normal normal normal 12px/17px Manrope",
                colors: "#072635",
                fontFamily: "Manrope",
              },
            },
          },
          stroke: {
            curve: "smooth",
          },
          markers: {
            size: 5,
            hover: {
              size: 7,
            },
          },
          colors: ["#E66FD2", "#8C6FE6"],
          dataLabels: {
            enabled: false,
          },
          grid: {
            borderColor: "rgba(0, 0, 0, 0.1)",
            xaxis: {
              lines: {
                show: false,
              },
            },
          },
          legend: {
            show: false,
          },
        };

        var chart = new ApexCharts(
          document.querySelector("#diagnosisHistoryChart"),
          options
        );
        chart.render();

        // Populate graph-details for Systolic and Diastolic
        const systolicEntry = patient.diagnosis_history.find(
          (entry) => entry.blood_pressure.systolic.value === maxSystolic
        );
        const diastolicEntry = patient.diagnosis_history.find(
          (entry) => entry.blood_pressure.diastolic.value === minDiastolic
        );
        $(".systolic-max").text(maxSystolic);
        $(".diastolic-max").text(minDiastolic);

        $(".systolic-level").text(systolicEntry.blood_pressure.systolic.levels);
        if (
          systolicEntry.blood_pressure.systolic.levels === "Higher than Average"
        ) {
          $(".systolic-level")
            .next("img")
            .attr("src", "assets/ArrowUp.svg")
            .show();
        } else if (
          systolicEntry.blood_pressure.systolic.levels === "Lower than Average"
        ) {
          $(".systolic-level")
            .next("img")
            .attr("src", "assets/ArrowDown.svg")
            .show();
        } else {
          $(".systolic-level").next("img").hide();
        }

        $(".diastolic-level").text(
          diastolicEntry.blood_pressure.diastolic.levels
        );
        if (
          diastolicEntry.blood_pressure.diastolic.levels ===
          "Higher than Average"
        ) {
          $(".diastolic-level")
            .next("img")
            .attr("src", "assets/ArrowUp.svg")
            .show();
        } else if (
          diastolicEntry.blood_pressure.diastolic.levels ===
          "Lower than Average"
        ) {
          $(".diastolic-level")
            .next("img")
            .attr("src", "assets/ArrowDown.svg")
            .show();
        } else {
          $(".diastolic-level").next("img").hide();
        }

        // Populate three-containers for average values
        const avgRespiratoryRate = (
          patient.diagnosis_history.reduce(
            (sum, entry) => sum + entry.respiratory_rate.value,
            0
          ) / patient.diagnosis_history.length
        ).toFixed(1);
        $(".rrate-value").text(`${avgRespiratoryRate} bpm`);
        $(".rrate-level").text(
          patient.diagnosis_history[0].respiratory_rate.levels
        );
        if ($(".rrate-level").text() === "Higher than Average") {
          $(".rrate-level")
            .next("img")
            .attr("src", "assets/ArrowUp.svg")
            .show();
        } else if ($(".rrate-level").text() === "Lower than Average") {
          $(".rrate-level")
            .next("img")
            .attr("src", "assets/ArrowDown.svg")
            .show();
        } else {
          $(".rrate-level").next("img").hide();
        }

        const avgTemperature = (
          patient.diagnosis_history.reduce(
            (sum, entry) => sum + entry.temperature.value,
            0
          ) / patient.diagnosis_history.length
        ).toFixed(1);
        $(".temp-value").text(`${avgTemperature}°F`);
        $(".temp-level").text(patient.diagnosis_history[0].temperature.levels);
        if ($(".temp-level").text() === "Higher than Average") {
          $(".temp-level").next("img").attr("src", "assets/ArrowUp.svg").show();
        } else if ($(".temp-level").text() === "Lower than Average") {
          $(".temp-level")
            .next("img")
            .attr("src", "assets/ArrowDown.svg")
            .show();
        } else {
          $(".temp-level").next("img").hide();
        }

        const avgHeartRate = (
          patient.diagnosis_history.reduce(
            (sum, entry) => sum + entry.heart_rate.value,
            0
          ) / patient.diagnosis_history.length
        ).toFixed(1);
        $(".hr-value").text(`${avgHeartRate} bpm`);
        $(".hr-level").text(patient.diagnosis_history[0].heart_rate.levels);
        if ($(".hr-level").text() === "Higher than Average") {
          $(".hr-level").next("img").attr("src", "assets/ArrowUp.svg").show();
        } else if ($(".hr-level").text() === "Lower than Average") {
          $(".hr-level").next("img").attr("src", "assets/ArrowDown.svg").show();
        } else {
          $(".hr-level").next("img").hide();
        }

        // Populate diagnostic list
        const diagnosticList = $(".diagnosis-list tbody");
        diagnosticList.empty();
        patient.diagnostic_list.forEach((diagnostic) => {
          diagnosticList.append(`
            <tr>
              <td>${diagnostic.name}</td>
              <td>${diagnostic.description}</td>
              <td>${diagnostic.status}</td>
            </tr>
          `);
        });
      }

      const patientList = $(".patient-list");
      data.forEach((patient) => {
        const isActive = patient.name === "Jessica Taylor" ? "active" : "";
        patientList.append(`
          <li class="${isActive}" data-patient-name="${patient.name}">
            <div>
              <img src="${patient.profile_picture}" alt="${patient.name}" height="40" />
              <div class="patient-details">
                <span class="name">${patient.name}</span>
                <span class="age">${patient.gender}, ${patient.age}</span>
              </div>
            </div>
            <img
              src="assets/more_horiz_FILL0_wght300_GRAD0_opsz24.svg"
              alt="Menu"
              height="20"
            />
          </li>
        `);
      });

      //  click event for patient list items
      $(".patient-list li").click(function () {
        $(".patient-list li").removeClass("active");
        $(this).addClass("active");

        const patientName = $(this).data("patient-name");
        const selectedPatient = data.find(
          (patient) => patient.name === patientName
        );
        populatePatientData(selectedPatient);
      });

      // Populate initial data for Jessica Taylor
      const jessicaData = data.find(
        (patient) => patient.name === "Jessica Taylor"
      );
      if (jessicaData) {
        populatePatientData(jessicaData);
      }

      //  click event for header buttons
      $(".header .middle button").click(function () {
        $(".header .middle button").removeClass("active");
        $(this).addClass("active");
      });
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
});
