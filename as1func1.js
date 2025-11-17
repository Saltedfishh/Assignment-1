function addRow(){
    var blocks = document.getElementById('blocks');
    var length = blocks.rows.length;
    var newRow = blocks.insertRow(length);//insert方法为js自带，按行插入和按列插入
    var eventCol = newRow.insertCell(0);
    var minCol = newRow.insertCell(1);
    var opCol = newRow.insertCell(2);
    eventCol.innerHTML = 'undefined';
    minCol.innerHTML = '0';
    opCol.innerHTML = '<td><button onclick="editRow(this)">Edit</button><button onclick="deleteRow(this)">Delete</button></td>';

}
function editRow(button){
    var row = button.parentNode.parentNode;
    var timeblock = row.cells[0];
    var mins = row.cells[1];

    var inputname = prompt("Please enter new time block:");
    var inputmins = prompt("Please enter minutes:");

    timeblock.innerHTML = inputname;
    mins.innerHTML = inputmins;
}

function deleteRow(button){
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}