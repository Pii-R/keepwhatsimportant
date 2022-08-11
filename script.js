window.onload = function () {
    inputElement = document.getElementById("input-file")
    inputElement.onchange = function (event) {
        var fileList = inputElement.files;
        parseDatatoGetSchema(fileList[0])

    }
    var newCsvFileName = document.getElementById("csv-file-name").value
    var submitOption = document.getElementById("submit-option");

    submitOption.addEventListener("click", function (event) {
        var columnsToRemove = handleSubmit(event)
        console.log(columnsToRemove)
        parseDataRemoveColumns(inputElement.files[0], columnsToRemove, newCsvFileName)


    });

}

function removeColumns(parsedCsv, columnsToRemove) {
    newParsedCsv = []
    for (i = 0; i < parsedCsv.data.length; i++) {
        newObj = {}
        for (key in parsedCsv.data[i]) {
            if (!(columnsToRemove.includes(key))) {
                newObj[key] = parsedCsv.data[i][key]
            }
        }
        newParsedCsv.push(newObj)

    }
    return newParsedCsv
}




function showCsvSchema(results) {
    //Data is usable here
    var schemaForm = document.getElementById("schema")
    // ajoute le nœud texte au nouveau div créé
    for (i = 0; i < Object.keys(results.data[0]).length; i++) {
        var opt = document.createElement('option');
        opt.value = Object.keys(results.data[0])[i];
        opt.innerHTML = Object.keys(results.data[0])[i];
        schemaForm.appendChild(opt);
    }
}
function handleSubmit(event) {
    event.preventDefault();
    var schemaSelect = document.getElementById("schema")
    columnsToRemove = [...schemaSelect.selectedOptions].map(o => o.value)
    return columnsToRemove
}
function parseDatatoGetSchema(url) {
    csvData = []
    Papa.parse(url, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            showCsvSchema(results)
        }
    });
}

function parseDataRemoveColumns(url, columnsToRemove, newCsvFileName) {
    csvData = []
    Papa.parse(url, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            newParsedCsv = removeColumns(results, columnsToRemove)
            unParsedNewCsv = Papa.unparse(newParsedCsv)
            downloadCSV(unParsedNewCsv, newCsvFileName)

        }
    });
}

function downloadCSV(unparse_csv, newCsvFileName) {
    var csvData = new Blob([unparse_csv], { type: 'text/csv;charset=utf-8;' });
    var csvURL = null;
    if (navigator.msSaveBlob) {
        csvURL = navigator.msSaveBlob(csvData, `${newCsvFileName}.csv`);
    }
    else {
        csvURL = window.URL.createObjectURL(csvData);
    }

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `${newCsvFileName}.csv`);
    tempLink.click();
    location.reload()
}