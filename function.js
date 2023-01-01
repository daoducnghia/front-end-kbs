var messages = [],
  lastUserMessage = "",
  botMessage = "",
  botName = "Chuyên gia",
  seconUserMessage = "";

function chatbotStart() {
  chatbotResponse(
    "Xin chào bạn! Bạn muốn làm gì?" +
      "<br>1. Chẩn đoán bệnh tiêu hoá." +
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
  messages.push("<b>" + botName + ":</b> " + botMessage);
  showMessage();
}

function getMessage() {
  lastUserMessage = document.getElementById("chatbox").value;
  document.getElementById("chatbox").value = "";
  messages.push(lastUserMessage);
}

function showMessage() {
  var html = "";
  for (var i = 0; i < messages.length; i++) {
    html += '<p class="chatlog">' + messages[i] + "</p>";
  }
  document.getElementById("chatResponse").innerHTML = html;
  var chatHistory = document.getElementById("chatResponse");
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
        }
      }
    }
  };
}

function KB1() {
  chatbotResponse(
    "Vui lòng nhập các triệu chứng bạn đang gặp phải!" +
      '<br><i>(Các triệu chứng ngăn cách nhau bằng dấu phẩy ",")'
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
            } else {
              chatbotResponse(
                "Không thể chẩn đoán bệnh của bạn, bạn cần đến trung tâm y tế để kiểm tra cũng như làm các xét nghiệm liên quan."
              );
            }
            chatbotResponse(
              "Bạn có muốn tiếp tục chẩn đoán bệnh không?(Có/Không)"
            );
            document.getElementById("chatbox").onkeydown = function (e) {
              if (e.keyCode == 13) {
                if (document.getElementById("chatbox").value != "") {
                  getMessage();
                  var dongY = [
                    "có",
                    "co",
                    "c",
                    "yes",
                    "y",
                    "đồng ý",
                    "ok",
                    "yup",
                  ];
                  if (dongY.includes(lastUserMessage.toLowerCase())) {
                    newEntry();
                  } else {
                    chatbotEnd();
                  }
                }
              }
            };
          })
          .catch((error) => console.log("error", error));
      }
    }
  };
}

function KB2() {
  chatbotResponse("Chưa phát triển!");
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
                              console.log(idThuoc);
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
                                        console.log(result1[i - 1]);
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
                                          "Tuổi phải nằm trong khoảng 1 đến 100 tuổi."
                                        );
                                        KB3();
                                      }
                                    }
                                  }
                                };
                            }
                          }
                          if (check1) {
                            chatbotResponse("");
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
            }
          }
        }
      };
    })
    .catch((error) => console.log("error", error));
}

function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}

newEntry();
