function downloadUrl(url) {
    window.open(url, '_self');
}

let button = document.querySelector("#upload")
let Download = document.querySelector("#download")
var result = {};
let db2


button.addEventListener("click", function() {
    upload()
    document.getElementsByClassName("spinner-border")[0].style.display = "block"
})


// charger le fichier
function upload() {
    var files = document.getElementById('file_upload').files;
    if (files.length == 0) {
        alert("Please choose any file...");
        return;
    }
    var filename = files[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
    if (extension == '.XLS' || extension == '.XLSX') {
        excelFileToJSON(files[0]);
    } else {
        alert("Please select a valid excel file.");
    }
}

//Excel to json
function excelFileToJSON(file) {
    try {

        var reader = new FileReader();
        reader.readAsBinaryString(file);



        reader.onload = function(e) {

            var data = e.target.result;

            var workbook = XLSX.read(data, {
                type: 'binary',
                cellDates: true,
                dateNF: "jj/mm/aaaa  hh:mm:ss "
            });

            //console.log("workbook = ", workbook)

            result = {};

            workbook.SheetNames.forEach(function(sheetName) {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    result[sheetName] = roa;
                    //("roa = ", roa)
                    //console.log("result {} =", result)
                }
            });
            //displaying the json result
            calcul_duree_trajet(result.Sheet1)
            testtime()
            var resultEle = document.getElementById("json-result");
            resultEle.value = JSON.stringify(new_db, null, 4);
            resultEle.style.display = 'block';
            //console.log("Json ", new_db);

            //console.log("stringy = ", JSON.stringify(result, null, 4))
        }



    } catch (e) {
        console.error(e);
    }
}

//-------------------------------------------------------------------------------
//stock resultat
let new_db = []

//point de depart
let depart = [{
        site: "NJSV",
        latitude: 43.44645663282992,
        longitude: 5.235984887532917
    },
    {
        site: "NJSNI",
        latitude: 43.710794183305104,
        longitude: 7.207720968882375
    },
    {
        site: "NJSS",
        latitude: 44.026563606798646,
        longitude: 4.88606549773054
    },
    {
        site: "NJSC",
        latitude: 49.038441212502754,
        longitude: 2.145117913275387
    },
    {
        site: "NJST",
        latitude: 48.75992136763409,
        longitude: 1.9846677132638213
    }
]


//fonction qui calcul le trajet (prend en arg la conversion du fichier excel en json)
function calcul_duree_trajet(arg1) {

    //boucle pour changer le format de la date et de l'heure
    for (let i = 0; i < arg1.length; i++) {
        const element = arg1[i];

        var myDate = new Date(element['DATE PREVUE (DEB.)']);
        element['DATE PREVUE (DEB.)'] = myDate.getDate() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getFullYear();
        //console.log(element['DATE PREVUE (DEB.)'])

        if (element['DATE PREVUE (DEB.)'] != null && element['DATE DEB REELLE'] != null && element['DT FIN REELLE'] != null) {

            var myHours = new Date(element['DATE DEB REELLE']);
            element['DATE DEB REELLE'] = myHours.getHours() + ":" + (myHours.getMinutes()) + ":" + myHours.getSeconds();
            //console.log(element['DATE DEB REELLE'])

            var myHours2 = new Date(element['DT FIN REELLE']);
            element['DT FIN REELLE'] = myHours2.getHours() + ":" + (myHours2.getMinutes()) + ":" + myHours2.getSeconds();
            //console.log(element['DT FIN REELLE'])

        }
        new_db.push(element)
    }
}



let j = 0

function test(arg1,arg2,arg3,arg4,arg5){
    let url = "https://api.tomtom.com/routing/1/calculateRoute/"+arg1+","+arg2+":"+arg3+","+arg4+"/json?instructionsType=text&language=fr-FR&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=truck&vehicleCommercial=false&vehicleEngineType=combustion&vehicleMaxSpeed=90&key=td6grjkDG2jQzoJ11fpgh0YN1ErrAT9I"
    console.log(url)
    fetch(url)
    .then(response => {
        return response.json()
    })
    .then(data => {
        //on met en minute le temps donnée par l'api
        console.log(data.routes[0].summary)
        let temps = data.routes[0].summary.travelTimeInSeconds/60

        //on met dans la colonne temps du excel le resultat sorti
        result.Sheet1[arg5]['TPS (MIN)'] = Math.round(temps) 

        //test
        console.log("temps sorti :" ,temps)
        console.log("temps ecrit :" ,result.Sheet1[arg5]['TPS (MIN)'])
        //console.log(result.Sheet1)
    })
    .then(error => {
        console.log(error)
    })
}




function testtime(){
    for (let m = 0; m < result.Sheet1.length; m++) {
        const elementary = result.Sheet1[m];
        elementary['TPS (MIN)'] = undefined
    }

    let time = setInterval(
    function(){

        console.log("point j", j)
        //def latitude, longitude
        let latitude_depart ;
        let longitude_depart ;
        let latitude_arrive = new_db[j].LATTITUDE;
        let longitude_arrive = new_db[j].LONGITUDE;

        //si la latitude et la longitude des colonnes excels != de undefined
        // if (new_db[j].LATTITUDE != undefined || new_db[j].LONGITUDE != undefined){
        //     latitude_arrive = new_db[j].LATTITUDE
        //     longitude_arrive = new_db[j].LONGITUDE
        // } else {
        //     latitude_arrive = "?"
        //     longitude_arrive = "?"
        // }
    
        //boucle pour voir si la colonne site correspond au site de la struct depart
        for (let k = 0; k < depart.length; k++) {
            const element2 = depart[k];
            const element = new_db[j]
            if (element.SOCIETE == element2.site) {
                latitude_depart = element2.latitude 
                longitude_depart = element2.longitude
            }
        }
        
        //test
        console.log("depart :",latitude_depart,longitude_depart,"arrive :",latitude_arrive,longitude_arrive)

        console.log("avant le test ",j)
        test(latitude_depart,longitude_depart,latitude_arrive,longitude_arrive,j);
        console.log("apres le test ",j)
        console.log(new_db[j]['TPS (MIN)'])
        //si j == longueur de new_db, alors on arrete

        if (j >= new_db.length-1){
            clearInterval(time)
            document.getElementsByClassName("telechargement")[0].style.display = "flex"
            document.getElementsByClassName("spinner-border")[0].style.display = "none"
        };


        

        //if (latitude_arrive != undefined && longitude_arrive != undefined) {
        
        // } else {
        //     latitude_arrive = 0
        //     longitude_arrive = 0
        // }

        console.log("avant ", j, "fin --------------------------");
        if (j < new_db.length){
            j++; 
        }
        console.log(result.Sheet1)
        console.log("apres "+j);
    },500)
}

    


//tableau des clefs d'api
// let apikey = ["&key=td6grjkDG2jQzoJ11fpgh0YN1ErrAT9I", "&key=afOvnlicMcsPlxYOIr6vEN9R76zs0zBe", "&key=Q3jFBMA7GNKwCS6sY4odbGZUVyGxOmd4", "&key=eYQd3WiPXXLVcYPiXOap7VJem6SJOJRj", "&key=wgqgpVSZZkGhJiQpvDdxczXNGQEnC8ke"]

// let counter = 0
// let size = 1

// function apiapp() {

//     for (counter; counter < size; counter++) {
//         if (counter < new_db.length) {
//             let element = new_db[counter]

//             //if (element.LATTITUDE != undefined && element.LONGITUDE != undefined) {


//                 /**
//                  * console.log test "
//                  * 
//                  * while(q!=150){
//                  * let a =5
//                  * }"
//                  */

//                 console.log(counter)

//                 let url = "https://api.tomtom.com/routing/1/calculateRoute/"
//                 let instruction = "json?instructionsType=text"
//                 let lang = "&language=fr-FR"
//                 let section = "&sectionType=traffic"
//                 let report = "&report=effectiveSettings"
//                 let routetype = "&routeType=eco"
//                 let traffic = "&traffic=true"
//                 let avoid = "&avoid=unpavedRoads"
//                 let travelmode = "&travelMode=truck"
//                 let vehicleCommercial = "&vehicleCommercial=false"

//                 let vehicleEngineType = "&vehicleEngineType=combustion"
//                 let vehicleMaxSpeed = "&vehicleMaxSpeed=90"
//                 let coordonnee_depart;
//                 let arrive_latitude = element.LATTITUDE
//                 let arrive_longitude = element.LONGITUDE
//                 let coordonnee_arrive = arrive_latitude + "," + arrive_longitude

//                 for (let j = 0; j < depart.length; j++) {
//                     const element2 = depart[j];
//                     if (element.SOCIETE == element2.site) {
//                         coordonnee_depart = element2.latitude + "," + element2.longitude
//                     }
//                 }

//                 console.log("marche")

//                 fetch(url + coordonnee_depart + ":" + coordonnee_arrive + "/" + instruction + lang + section + report + routetype + traffic + avoid + travelmode + vehicleCommercial + vehicleEngineType + vehicleMaxSpeed + apikey[0])
//                     .then(response => {

//                         return response

//                     })
//                     .then(data => {

//                         //let distance = data.routes[0].summary.lengthInMeters
//                         //let arrive = data.routes[0].summary.arrivalTime
//                         //let depart = data.routes[0].summary.departureTime
//                         let temps = data.routes[0].summary.travelTimeInSeconds
//                         //let temps_bouchons = data.routes[0].summary.trafficDelayInSeconds
//                         //let distance_bouchons = data.routes[0].summary.trafficLengthInMeters

//                         console.log(temps)
//                         element['TPS (MIN)'] = temps / 60
//                         console.log("TEMPS : ", element['TPS (MIN)'])
//                         console.log("1")

//                     })
//                     .catch(error => {
//                         console.log(error)
//                     });
//             }

//         // } else {
//         //     break
//         // }

//         if (size < new_db.length){
//             setTimeout(size = size+1,1000)
           
//         } else{
//             break
//         }
        
        
//     }
// }

//-------------------------------------------------------------------------------


var xlsRows;
var xlsHeader;

var xlsRows2;
var xlsHeader2;

Download.addEventListener("click", function() {

    var createXLSLFormatObj = [];

    /* XLS1 Head Columns */
    xlsHeader = ["ID", "PBME", "SOCIETE", "NUM COM", "CLIENT", "REF CLI", "TYPE", "LIEU", "VILLE", "MEMO", "EVT", "DATE PREVUE (DEB.)", "DATE DEB REELLE", "DT FIN REELLE", "TPS (MIN)", "LONGITUDE", "LATTITUDE", "CP VILLE FINAL LIV"];

    /* XLS1 Rows Data */
    xlsRows = result
    console.log("Resultat = ", xlsRows)

    createXLSLFormatObj.push(xlsHeader);
    console.log("createXLSLFormatObj = ", createXLSLFormatObj)

    xlsRows.Sheet1.forEach(element => {
        var innerRowData = [];
        console.log("element : ", element)

        xlsHeader.forEach(val => {
            innerRowData.push(element[val]);
            console.log("valeur : ", val)
        });
        createXLSLFormatObj.push(innerRowData);
    });



    // for (let i = 0; i < xlsRows.Sheet1.length; i++) {

    //     const element = xlsRows.Sheet1[i];
    //     console.log("for ",element)
    //     var innerRowData = [];
    //     innerRowData.push(element)
    //     createXLSLFormatObj.push(innerRowData);
    //     console.log("createXLSLFormatObj for = ",createXLSLFormatObj)
    // }




    // $.each(xlsRows, function(index, value) {
    //     var innerRowData = [];
    //     $("tbody").append('<tr><td>' + value.EmployeeID + '</td><td>' + value.FullName + '</td></tr>');
    //     $.each(value, function(ind, val) {
    //         innerRowData.push(val);
    //     });
    //     createXLSLFormatObj.push(innerRowData);
    // });


    /* File Name */
    var filename = document.getElementById("file_upload").files[0].name + ".xlsx"

    /* Sheet Name */
    var ws_name = "Feuille complète";

    if (typeof console !== 'undefined') console.log(new Date());

    var wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj)

    /* Add worksheet to workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    /* Write workbook and Download */
    if (typeof console !== 'undefined') console.log(new Date());
    XLSX.writeFile(wb, filename);
    //XLSX.writeFile(wb2, filename);
    if (typeof console !== 'undefined') console.log(new Date());

})