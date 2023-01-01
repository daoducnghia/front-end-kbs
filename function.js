var messages = [],
  lastUserMessage = "",
  botMessage = "",
  botName = "Chuyên gia",
  seconUserMessage = "";

function chatbotStart() {
  chatbotResponse(
    "Xin chào bạn! Bạn muốn làm gì?" +
      "<br>1. Chẩn đoán bệnh tiêu hoá." +
      "<br>2. làm gì đó." +
      "<br>3. Làm gì đó." +
      "<br><i>(Vui lòng nhập các lựa chọn bằng số)</i>"
  );
}
function chatbotEnd() {
  chatbotResponse("Cảm ơn bạn đã sử dụng hệ thống!"+
  "<br>Tạm biệt bạn! Chúc bạn một ngày tốt lành.")
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
        getMessage()
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
            if(result.value != '0'){
              chatbotResponse("Có thể bạn đang bị bệnh <b>"+result.message+"</b>");
            } else {
              chatbotResponse("Không thể chẩn đoán bệnh của bạn, bạn cần đến trung tâm y tế để kiểm tra cũng như làm các xét nghiệm liên quan.")
            }
            chatbotResponse("Bạn có muốn thực hiện chức năng khác?")
            document.getElementById("chatbox").onkeydown = function (e) {
              if (e.keyCode == 13) {
                if (document.getElementById("chatbox").value != "") {
                  getMessage();
                  var dongY = ['có', 'co', 'c', 'yes', 'y', 'đồng ý', 'ok', 'yup']
                  if(dongY.includes(lastUserMessage.toLowerCase())){
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
  chatbotResponse("Chưa phát triển!");
}

function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}

newEntry();
