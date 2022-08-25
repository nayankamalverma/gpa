const gpwd_set = new Set();
const passArray = [];

// let selectedBucket = document.getElementById();
function onSelectImage(res) {
  console.log(res);
  let selectedBucket = document.querySelector(
    'input[name="radios"]:checked'
  ).value;
  // console.log(selectedBucket);

  if (gpwd_set.has(res)) {
    if (res == passArray[passArray.length - 1].split(":_:")[0]) {
      passArray.pop();
      gpwd_set.delete(res);
      // document.getElementById(res).style.border = null;
      document.getElementById(res).classList.remove("image-border");
      document.getElementById(`${res}_num`).classList.remove("num");
      document.getElementById(`${res}_num`).textContent = "";
    } else {
      console.log("Delete last element in order first!");
    }
  } else {
    passArray.push(`${res}:_:${selectedBucket}`);
    gpwd_set.add(res);
    // document.getElementById(res).style.border = "4px solid orange";
    // document.getElementById(res).style.borderRadius = "100%";
    document.getElementById(res).classList.add("image-border");
    document.getElementById(`${res}_num`).classList.add("num");
    document.getElementById(`${res}_num`).textContent = passArray.length;
    console.log(passArray);
  }

  // if (gpwd_set.has(res)) {
  //     console.log('true');
  //     gpwd_set.delete(res);
  //     document.getElementById(res).style.border = null;
  // } else {
  //     gpwd_set.add(res);
  //     document.getElementById(res).style.border = "4px solid orange";
  //     document.getElementById(res).style.borderRadius = '100%';
  //     console.log(gpwd_set)
  // }
}

function post(path, params, method = "post") {
  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  const form = document.getElementById("post-form");
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

// Submit post on submit
var form = document.getElementById("post-form");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  let inputObj;
  if (!document.getElementById("email") && !document.getElementById("name")) {
    inputObj = {
      password: passArray,
    };
  } else {
    !document.getElementById("name")
      ? (inputObj = {
          email: document.getElementById("email").value,
          password: passArray,
        })
      : (inputObj = {
          name: document.getElementById("name").value,
          number: document.getElementById("number").value,
          email: document.getElementById("email").value,
          password: passArray,
        });
  }
  post("", inputObj);
});

function onVisibility() {
  document.querySelector(".visibility").classList.toggle("hidden");
  document.querySelector(".visibility1").classList.toggle("hidden");
  document.querySelectorAll(".hide").forEach(function (item) {
    item.classList.toggle("hidden");
  });
  
  document.querySelectorAll(".hide-img").forEach(function (item) {
    item.classList.toggle("hide-image-border");
  });
}
