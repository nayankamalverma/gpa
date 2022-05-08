const gpwd_set = new Set()
function onSelect(res) {
   
    if (gpwd_set.has(res)) {
        console.log('true');
        gpwd_set.delete(res);
        document.getElementById(res).style.border = null;
    } else {
        gpwd_set.add(res);
        document.getElementById(res).style.border = "4px solid orange";
        document.getElementById(res).style.borderRadius = '100%';
        console.log(gpwd_set)
    }
}

function post(path, params, method = 'post') {

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    const form = document.getElementById('post-form');
    form.method = method;
    form.action = path;

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

// Submit post on submit
var form = document.getElementById('post-form');
form.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log("form submitted!");
    post('', {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: Array.from(gpwd_set),
    })
});