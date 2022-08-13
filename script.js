window.onload = function () {
    df_import_csvfile = null
    inputFile = document.getElementById("input-file")
    inputFile.addEventListener("change", importData)
    var submitOption = document.getElementById("remove-fields-btn")
    submitOption.addEventListener("click", function (event) {
        var columnsToRemove = handleSubmitRemoveFields(event)
        checkCondition(df_import_csvfile, "no file imported", removeFieldsFromDf(df_import_csvfile, columnsToRemove))
    })
    document.getElementById('schema').onmousedown = function (e) {
        e.preventDefault();
        var st = this.scrollTop;
        if (!e.target.disabled) {
            e.target.selected = !e.target.selected;
            setTimeout(() => this.scrollTop = st, 0);
            this.focus();
        }
    }

    document.getElementById('schema').onmousemove = function (e) {
        e.preventDefault();
    }
    var downloadBtn = document.getElementById("download-btn")
    downloadBtn.addEventListener("click", function (event) {
        csv_from_df = dfd.toCSV(df_import_csvfile, { header: true })
        newCsvFileName = document.getElementById("csv-file-name").value
        createNewFile(df_import_csvfile, lineTwo)
        checkCondition(df_import_csvfile, "no file imported", downloadCSV(csv_from_df, newCsvFileName))

    })
    var refreshBtn = document.getElementById("refresh-btn")
    refreshBtn.addEventListener("click", function () { location.reload() })

    var computeBtn = document.getElementById("compute-btn")
    computeBtn.addEventListener("click", function (event) {
        scValue = document.getElementById("sc").value
        yValue = document.getElementById("y").value
        if (scValue === "" | yValue === "") {
            alert("Sc and Y must be number or float")
            document.getElementById("sc").value = ""
            document.getElementById("y").value = ""
        }
        else {
            addNewColumns(df_import_csvfile, parseFloat(scValue), parseFloat(yValue))
            df_import_csvfile = insertNewRows(df_import_csvfile, parseFloat(yValue))
            document.getElementById("compute-btn").value = document.getElementById("compute-btn").value + " ✅"
            alert("Computation ended")
        }



    })
}
async function importData() {

    var fileReader = new FileReader();
    const csvFile = inputFile.files[0]
    document.getElementById("csv-file-name").value = csvFile.name.split(".txt")[0] + "-KeyDataOnly"
    fileReader.readAsText(csvFile, "UTF-8");
    df_import_csvfile = null
    fileReader.onload = function () {
        var stringData = fileReader.result;
        arrData = stringData.split(/\r?\n/)
        arrHeader = arrData[29].split(",")
        lineTwo = arrData[1]
        arrNeedData = arrData.slice(30, -1)
        mapNeedData = arrNeedData.map(l => l.split(",").slice(0, -2))
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
    if (df !== null) {
        df.drop
            ({ columns: columnsToRemove, inplace: true });

    }
    showCsvSchema(df_import_csvfile)

}
function createNewFile(df, lineTwo) {
    arrNewFile = new Array()
    arrNewFile.push(lineTwo)
    jsonData = dfd.toJSON(df_import_csvfile, { format: 'row' })
    csvData = dfd.toCSV(df_import_csvfile)
    csvData = csvData.replaceAll("NaN", "")
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
    tempLink.setAttribute('download', `${newCsvFileName}.txt`);
    tempLink.click();
    location.reload()
}

function showCsvSchema(df) {
    resetSchema()
    var schemaForm = document.getElementById("schema")
    columns = df.columns
    for (i = 0; i < columns.length; i++) {
        var opt = document.createElement('option');
        opt.value = columns[i];
        opt.innerHTML = columns[i];
        if (["Row", "Time", "Fx", "Fy", "Fz", "Mx", "My", "MxProx", "MyProx", "CPX", "CPY"].includes(columns[i])) {
            opt.disabled = "disabled"

        }
        schemaForm.appendChild(opt);
    }
}

function addNewColumns(df, sc, y) {
    df.resetIndex({ inplace: true })
    df.addColumn("i", df.index.map(e => 2 * e), { inplace: true })
    df.addColumn("Xsag", df["Fy"].mul(sc).div(100).add((df["Mx"].mul(1).add((df["Fy"].mul(y)).div(df["Fz"])))), { inplace: true })
    df.addColumn("Ysag", df["Fz"], { inplace: true })
    df.addColumn("XCor", df["Fx"].mul(sc).div(100).add((df["My"].mul(1).add((df["Fx"].mul(y)).div(df["Fz"])))), { inplace: true })
    df.addColumn("YCor", df["Fz"], { inplace: true })

}

function insertNewRows(df, y) {
    df.resetIndex({ inplace: true })
    indexColumn = df.index.map(e => 2 * e + 1)
    xsagColumn = df["Mx"].mul(1).add(df["Fy"].mul(y)).div(df["Fz"]).values
    ysagColumn = Array(df.shape[0]).fill(0)
    xCorColum = df["My"].mul(1).add(df["Fx"].mul(y)).div(df["Fz"]).values
    yCorColumn = Array(df.shape[0]).fill(0)
    data = { "i": indexColumn, "Xsag": xsagColumn, "Ysag": ysagColumn, "XCor": xCorColum, "YCor": yCorColumn }
    new_df = new dfd.DataFrame(data)
    df_final = dfd.concat({ dfList: [df, new_df], axis: 0 })
    df_final.setIndex({ column: "i", inplace: true })
    df_final.sortIndex({ inplace: true })
    df_final.fillNa("NaN", { inplace: true })
    df_final.drop({ columns: ["i"], inplace: true })
    return df_final



}
function checkCondition(df, message, callback) {
    if (df === null) {
        alert(message)
    }
    else {
        callback
    }
}
function resetSchema() {
    var schemaForm = document.getElementById("schema")
    var i, L = schemaForm.options.length - 1;
    for (i = L; i >= 0; i--) {
        schemaForm.remove(i);
    }
    var opt = document.createElement('option');
    opt.disabled = "disabled";
    opt.innerHTML = "--fields --";
    schemaForm.appendChild(opt);
}