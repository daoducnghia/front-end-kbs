var messages = [],
  lastUserMessage = "",
  botMessage = "",
  botName = "Chuyên gia",
  seconUserMessage = "";
var tenbenh = "";

function chatbotStart() {
  chatbotResponse(
    "Xin chào bạn! Bạn muốn làm gì?" +
      "<br>1. Chẩn đoán một số bệnh tiêu hoá." +
      "<br>2. Xác định cách điều trị theo nguyên nhân." +
      "<br>3. Tìm kiếm thông tin thuốc." +
      "<br><i>(Vui lòng nhập các lựa chọn bằng số)</i>"
  );
}
function chatbotEnd() {
  chatbotResponse(
    "Cảm ơn bạn đã sử dụng hệ thống!" +
      "<br>Tạm biệt bạn! Chúc bạn một ngày tốt lành."
  );
}
function chatBotRequestFunction(f) {
  chatbotResponse(
    "Bạn có muốn tiếp tục sử dụng chức năng này không? (Có/Không)"
  );
  document.getElementById("chatbox").onkeydown = function (e) {
    if (e.keyCode == 13) {
      if (document.getElementById("chatbox").value != "") {
        getMessage();
        var dongY = ["có", "co", "c", "yes", "y", "đồng ý", "ok", "yup"];
        if (dongY.includes(lastUserMessage.toLowerCase())) {
          f();
        } else {
          newEntry();
        }
      }
    }
  };
}

function chatbotResponse(text = "") {
  botMessage = "Xin lỗi, tôi không thể thực hiện chức năng này!";
  if (text != "") {
    botMessage = text;
  }
  messages.push(
    '<nav class="logChatBot"><b>' + botName + ":</b> " + botMessage + "</nav>"
  );
  showMessage();
}

function getMessage() {
  lastUserMessage = document.getElementById("chatbox").value;
  document.getElementById("chatbox").value = "";
  messages.push('<nav class="logUser">' + lastUserMessage + "</nav>");
}

function showMessage() {
  var html = '<div class="nav">';
  for (var i = 0; i < messages.length; i++) {
    html += '<div class="chatlog">' + messages[i] + "</div>";
  }
  html += "</div>";
  document.getElementById("chatResponse").innerHTML = html;

  var chatHistory = document.getElementsByClassName("nav").item(0);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}
var check;
function newEntry() {
  chatbotStart();
  document.getElementById("chatbox").onkeydown = function (e) {
    if (e.keyCode == 13) {
      if (document.getElementById("chatbox").value != "") {
        getMessage();
        if (lastUserMessage == "1") {
          KB1();
        } else if (lastUserMessage == "2") {
          KB2();
        } else if (lastUserMessage == "3") {
          KB3();
        } else {
          chatbotResponse();
          chatbotResponse("Vui lòng chọn lại!");
        }
      }
    }
  };
}

function KB1() {
  chatbotResponse("Bạn đã chọn chức năng: Chẩn đoán một số bệnh tiêu hoá");
  chatbotResponse(
    "Vui lòng nhập các triệu chứng bạn đang gặp phải!" +
      '<br><i>(Các triệu chứng ngăn cách nhau bằng dấu phẩy ",")</i>'
  );
  document.getElementById("chatbox").onkeydown = function (e) {
    if (e.keyCode == 13) {
      if (document.getElementById("chatbox").value != "") {
        getMessage();
        let listTrieuChung = [];
        let txtArray = lastUserMessage.split(",");
        for (let i of txtArray) {
          i = i.trim();
          if (i != "" && !listTrieuChung.includes(i)) {
            listTrieuChung.push(i);
          }
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(listTrieuChung);

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch("http://localhost:8080/api/cbr-benh", requestOptions)
          .then((response) => response.json())
          .then((result) => {
            if (result.value != "0") {
              chatbotResponse(
                "Có thể bạn đang bị bệnh <b>" + result.message + "</b>"
              );
              var myHeaders1 = new Headers();
              myHeaders1.append("Content-Type", "application/json");

              var raw1 = JSON.stringify({
                name: result.message,
              });

              var requestOptions1 = {
                method: "POST",
                headers: myHeaders1,
                body: raw1,
                redirect: "follow",
              };

              fetch(
                "http://localhost:8080/api/get-benh-by-name",
                requestOptions1
              )
                .then((response1) => response1.json())
                .then((result1) => {
                  chatbotResponse(
                    "Thông tin bệnh " +
                      result1.name +
                      ": " +
                      result1.description
                  );
                  chatBotRequestFunction(KB1);
                })
                .catch((error) => console.log("error", error));
            } else {
              chatbotResponse(
                "Không thể chẩn đoán bệnh của bạn, bạn cần đến trung tâm y tế để kiểm tra cũng như làm các xét nghiệm liên quan."
              );
              chatBotRequestFunction(KB1);
            }
          })
          .catch((error) => console.log("error", error));
      }
    }
  };
}
var listNguyenNhan = [];
function KB2() {
  listNguyenNhan = [];
  tenbenh = "";
  chatbotResponse(
    "Bạn đã chọn chức năng: Xác định nguyên nhân và cách điều trị"
  );
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch("http://localhost:8080/get-benh", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var cnt = 1; // thuc hien chon benh
      var text = "Vui lòng chọn bệnh.";

      for (var i of result) {
        text += "<br>" + cnt + ". " + i.name;
        cnt++;
      }
      text += "<br><i>(Vui lòng nhập các lựa chọn bằng số)</i>";
      chatbotResponse(text);

      document.getElementById("chatbox").onkeydown = function (e) {
        if (e.keyCode == 13) {
          if (document.getElementById("chatbox").value != "") {
            getMessage();
            var check = true;
            for (var i = 1; i < cnt; i++) {
              if (lastUserMessage == i) {
                check = false;
                tenbenh = result[i - 1].name;
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                var raw = JSON.stringify({
                  id: result[i - 1].id,
                });

                var requestOptions = {
                  method: "POST",
                  headers: myHeaders,
                  body: raw,
                  redirect: "follow",
                };
                fetch("http://localhost:8080/get-cauhoi-po", requestOptions)
                  .then((response1) => response1.json())
                  .then((result1) => {
                    // get cau hoi
                    findCause(0, result1);
                  })
                  .catch((error1) => console.log("error", error1));
              }
            }

            if (check) {
              chatbotResponse("");
              chatbotResponse("Vui lòng chọn lại!");
            }
          }
        }
      };
    })
    .catch((error) => console.log("error", error));
}
function KB3() {
  chatbotResponse("Bạn đã chọn chức năng: Tìm kiếm thông tin thuốc.");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch("http://localhost:8080/get-all-benh", requestOptions) // Chon benh tu danh sach
    .then((response) => response.json())
    .then((result) => {
      var cnt = 1;
      var text = "Vui lòng chọn bệnh.";
      for (var i of result) {
        text += "<br>" + cnt + ". " + i.name;
        cnt++;
      }
      text += "<br><i>(Vui lòng nhập các lựa chọn bằng số)</i>";
      chatbotResponse(text); //Het chon benh

      document.getElementById("chatbox").onkeydown = function (e) {
        if (e.keyCode == 13) {
          if (document.getElementById("chatbox").value != "") {
            getMessage();
            var check = true;
            for (var i = 1; i < cnt; i++) {
              if (lastUserMessage == i) {
                check = false;
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                var raw = JSON.stringify({
                  name: result[i - 1].name,
                });

                var requestOptions = {
                  method: "POST",
                  headers: myHeaders,
                  body: raw,
                  redirect: "follow",
                };

                fetch("http://localhost:8080/get-all-thuoc", requestOptions) // Chon thuoc tu danh sach
                  .then((response1) => response1.json())
                  .then((result1) => {
                    var cnt1 = 1;
                    var text1 = "Vui lòng chọn thuốc.";
                    for (var i of result1) {
                      text1 += "<br>" + cnt1 + ". " + i.thuoc;
                      cnt1++;
                    }
                    text1 += "<br><i>(Vui lòng nhập các lựa chọn bằng số)</i>";
                    chatbotResponse(text1); // Het chon thuoc

                    document.getElementById("chatbox").onkeydown = function (
                      e
                    ) {
                      if (e.keyCode == 13) {
                        if (document.getElementById("chatbox").value != "") {
                          getMessage();
                          var check1 = true;

                          for (var i = 1; i < cnt1; i++) {
                            if (lastUserMessage == i) {
                              var idThuoc = result1[i - 1].id;
                              check1 = false;
                              chatbotResponse("Vui lòng nhập tuổi.");
                              document.getElementById("chatbox").onkeydown = // chon tuoi
                                function (e) {
                                  if (e.keyCode == 13) {
                                    if (
                                      document.getElementById("chatbox")
                                        .value != ""
                                    ) {
                                      getMessage();
                                      var reg = /^[1-9]?[0-9]{1}$|^100$/;

                                      if (lastUserMessage.match(reg)) {
                                        ///////////////////////
                                        var myHeaders = new Headers();
                                        myHeaders.append(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        var tuoi1 = lastUserMessage;

                                        var raw = JSON.stringify({
                                          tuoi: tuoi1,
                                          id_thuoc: idThuoc,
                                        });

                                        var requestOptions = {
                                          method: "POST",
                                          headers: myHeaders,
                                          body: raw,
                                          redirect: "follow",
                                        };

                                        fetch(
                                          "http://localhost:8080/get-ld-cd",
                                          requestOptions
                                        )
                                          .then((response2) => response2.json())
                                          .then((result2) => {
                                            chatbotResponse(
                                              "Liều dùng: " + result2.ld.dosage
                                            );
                                            chatbotResponse(
                                              "Cách dùng: " + result2.cd.use
                                            );
                                            chatBotRequestFunction(KB3);
                                          })
                                          .catch((error2) =>
                                            console.log("error", error2)
                                          );
                                      } else {
                                        chatbotResponse(
                                          "Tuổi phải là các số tự nhiên trong khoảng 0 đến 100 tuổi."
                                        );
                                        chatbotResponse("Vui lòng nhập lại!");
                                      }
                                    }
                                  }
                                };
                            }
                          }
                          if (check1) {
                            chatbotResponse("");
                            chatbotResponse("Vui lòng chọn lại!");
                          }
                        }
                      }
                    };
                  })
                  .catch((error1) => console.log("error", error1));
              }
            }
            if (check) {
              chatbotResponse("");
              chatbotResponse("Vui lòng chọn lại!");
            }
          }
        }
      };
    })
    .catch((error) => console.log("error", error));
}

function findCause(i, que) {
  if (i >= que.length) {
    if (listNguyenNhan.length == 0) {
      chatbotResponse("Không thể xác định cách điều trị chính xác.");
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        name: tenbenh,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch("http://localhost:8080/get-all-cach-dieu-tri", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          var cnt = 1;
          var txt = "Bạn có thể tham khảo các cách điều trị dưới đây.";
          for (var i of result) {
            txt += "<br>" + cnt + ". " + i.name;
            cnt++;
          }

          chatbotResponse(txt);
          chatBotRequestFunction(KB2);
        })
        .catch((error) => console.log("error", error));
    } else {
      findNN();
    }

    //findTreatment();
    return;
  }
  chatbotResponse(que[i].cauhoi);
  document.getElementById("chatbox").onkeydown = function (e) {
    if (e.keyCode == 13) {
      if (document.getElementById("chatbox").value != "") {
        getMessage();
        var dongY = ["có", "co", "c", "yes", "y", "đồng ý", "ok", "yup"];
        if (dongY.includes(lastUserMessage.toLowerCase())) {
          if (que[i].answer == "yes") listNguyenNhan.push(que[i].nguyennhan.id);
        } else {
          if (que[i].answer == "no") {
            listNguyenNhan.push(que[i].nguyennhan.id);
          }
        }

        findCause(i + 1, que);
      }
    }
  };
}
function findTreatment() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(listNguyenNhan);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("http://localhost:8080/cach-dieu-tri", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      let txt = "";
      let cnt = 1;
      for (let r of result) {
        txt += "<br>" + cnt + ". " + r.name;
        cnt++;
      }
      chatbotResponse("Cách điều trị:" + txt);
      chatBotRequestFunction(KB2);
    })
    .catch((error) => console.log("error", error));
}

function findNN() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(listNguyenNhan);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("http://localhost:8080/get-nguyen-nhan", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      let txt = "";
      let cnt = 1;
      for (let r of result) {
        txt += "<br>" + cnt + ". " + r.name;
        cnt++;
      }
      chatbotResponse("Nguyên nhân:" + txt);
      findTreatment();
    })
    .catch((error) => console.log("error", error));
}
// function placeHolder() {
//   document.getElementById("chatbox").placeholder = "";
// }

newEntry();
