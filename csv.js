window.onload = function () {
    inputFile = document.getElementById("input-file")
    inputFile.addEventListener("change", getDf)
    var submitOption = document.getElementById("remove-fields-btn")
    submitOption.addEventListener("click", function (event) {
        var columnsToRemove = handleSubmitRemoveFields(event)
        removeFieldsFromDf(df_import_csvfile, columnsToRemove)
    })
    var downloadBtn = document.getElementById("download-btn")

    downloadBtn.addEventListener("click", function (event) {
        csv_from_df = dfd.toCSV(df_import_csvfile, { header: true })
        newCsvFileName = document.getElementById("csv-file-name").value
        createNewFile(df_import_csvfile, lineTwo)
        downloadCSV(csv_from_df, newCsvFileName)
    })
}
async function getDf() {
    var fileReader = new FileReader();
    const csvFile = inputFile.files[0]

    fileReader.readAsText(csvFile, "UTF-8");
    df_import_csvfile = null
    fileReader.onload = function () {
        var stringData = fileReader.result;
        arrData = stringData.split(/\r?\n/)
        arrHeader = arrData[29].split(",")
        lineTwo = arrData[1]
        arrNeedData = arrData.slice(30, -1)
        mapNeedData = arrNeedData.map(l => l.split(","))
        df = new dfd.DataFrame(mapNeedData, { arrHeader })
        currentColumns = df.columns
        objChangeColumns = currentColumns.reduce((accumulator, element, index) => {
            return { ...accumulator, [element]: arrHeader[index] };
        }, {});
        df = df.rename(objChangeColumns)
        df_import_csvfile = df
        showCsvSchema(df_import_csvfile)


    }
}

function handleSubmitRemoveFields(event) {
    event.preventDefault();
    var fieldsSelect = document.getElementById("schema")
    columnsToRemove = [...fieldsSelect.selectedOptions].map(o => o.value)
    return columnsToRemove
}

function removeFieldsFromDf(df, columnsToRemove) {
    //try catch
    if (df !== null) {
        df.drop
            ({ columns: columnsToRemove, inplace: true });
    }
}
function createNewFile(df, lineTwo) {
    arrNewFile = new Array()
    arrNewFile.push(lineTwo)
    jsonData = dfd.toJSON(df_import_csvfile, { format: 'row' })
    csvData = dfd.toCSV(df_import_csvfile)
    arrNewFile.push(csvData)
    arrNewFile = arrNewFile.join("\n")
    return arrNewFile
}
function downloadCSV(df, newCsvFileName) {
    csv = createNewFile(df, lineTwo)
    var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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

function showCsvSchema(df) {
    //Data is usable here
    var schemaForm = document.getElementById("schema")
    columns = df.columns
    // ajoute le nœud texte au nouveau div créé
    for (i = 0; i < columns.length; i++) {
        var opt = document.createElement('option');
        opt.value = columns[i];
        opt.innerHTML = columns[i];
        schemaForm.appendChild(opt);
    }
}
