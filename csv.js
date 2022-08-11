window.onload = function () {
    df_import_csvfile = null
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

        downloadCSV(csv_from_df, newCsvFileName)
    })
}
async function getDf() {
    const csvFile = inputFile.files[0]
    dfd.readCSV(csvFile, { header: true, dynamic_typing: true }).then((df) => {
        df_import_csvfile = df
        showCsvSchema(df_import_csvfile)

    })
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
function downloadCSV(csv, newCsvFileName) {
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
