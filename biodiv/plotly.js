// references
var $sampleMetadata = document.getElementById("sampleMetadata"); 
var $bubble = document.getElementById("bubble");
var $selDataset = document.getElementById("selDataset"); //dropdown options
var $pie = document.getElementById("pie");

// dropdown
d3.json("/names", function(error, response) {
    if (error) return console.log(error);
    
    var items = response;
    
    // dropdown options
    for (var i = 0; i < items.length; i++) {
        var $option = document.createElement("option");
        $option.setAttribute("value", items[i]);
        $option.innerHTML = items[i];
        
        $selDataset.appendChild($option);
    };
});

// landing page
function init() {
    d3.json("/metadata/BB_940", function(error,response) {
        if (error) return console.log(error);
        
        var keys = Object.keys(response);
        
        for (var i = 0; i < keys.length; i++) {
            var $p = document.createElement("p");
            $p.innerHTML = `${keys[i]}: ${response[keys[i]]}`;
            
            $sampleMetadata.appendChild($p);
        };
        
    });
}

// pie chart
d3.json("/samples/BB_940", function(error,response) {
    if (error) console.log(error);
    
    var idSlice = response.otu_ids.slice(0,10);
    var valueSlice = response.sample_values.slice(0,10);
    
    // pie variables/data 
    var pieIds = [];
    var pieValues = [];
    
    for (var i = 0; i < valueSlice.length; i++) {
        if (valueSlice[i] != 0) {
            pieIds.push(idSlice[i]);
            pieValues.push(valueSlice[i]);
        };
        
    };
    
    // bubble chart data/variables
    var bubbleIds = [];
    var bubbleValues =[];
    
    for (var i = 0; i < response.sample_values.length; i++) {
        if (response.sample_values[i] != 0) {
            bubbleIds.push(response.otu_ids[i]);
            bubbleValues.push(response.sample_values[i]);
        };
    };
    
    // pie and bubble graphs
    d3.json("/otu", function(error, response) {
        if (error) console.log(error);
        
        // pie
        var pieLabels = [];
        for (var i = 0; i < pieIds.length; i++){
            pieLabels.push(response[pieIds[i]]);
        };
        
        var pieData = [{
            values: pieValues,
            labels: pieIds,
            type: "pie",
            hovertext: pieLabels
        }];
        // console.log('INIT **********  pieData values: ', pieValues);
        // console.log('INIT ********** pieData labels: ', pieIds)
        // console.log('------------------------------')
        // Plotly.newPlot("pie", pieData);
        
        // bubble
        var bubbleLabels = [];
        for (var i = 0; i < bubbleIds.length; i++) {
            bubbleLabels.push(response[bubbleIds[i]]);
        };
        
        var bubbleData = [{
            x: bubbleIds,
            y: bubbleValues,
            mode: "markers",
            text: bubbleLabels,
            marker: {
                size: bubbleValues,
                color: bubbleIds.map(row=>row),
                colorscale: "Rainbow"
            }
        }];
        
        var bubbleLayout = {
            xaxis: {
                title: "OTUs"
            }
        };
        Plotly.newPlot("bubble", bubbleData, bubbleLayout);
        
    });
}); 

// updates plots
function updatePlots(newPie, newBubble) {
    var pieUpdate = [{
        values: newPie.value,
        labels: newPie.labels,
        hovertext: newPie.hovertext,
        type: 'pie'
    }];
    // console.log('newPie: UPDATE: ', newPie)

    // console.log('UPDATE ++++++++++  pieData values: ', newPie.value);
    // console.log('UPDATE ++++++++++ pieData labels: ', newPie.labels)
    // console.log('------------------------------')

    Plotly.newPlot("pie", pieUpdate);
    
    Plotly.restyle("bubble", "x", [newBubble.x]);
    Plotly.restyle("bubble", "y", [newBubble.y]);
    Plotly.restyle("bubble", "text", [newBubble.text]);
    Plotly.restyle("bubble", "marker.size", [newBubble.y]);
    Plotly.restyle("bubble", "marker.color", [newBubble.x.map(row=>row)]);
};

function optionChanged(dataset) {
    console.log('option changed')
    var dataURL = `/metadata/${dataset}`;
    d3.json(dataURL, function(error, response) {
        if (error) return console.log(error);
        
        $sampleMetadata.innerHTML = "";
        
        var keys = Object.keys(response);
        
        for (var i = 0; i < keys.length; i++) {
            var $p = document.createElement("p");
            $p.innerHTML = `${keys[i]}: ${response[keys[i]]}`;
            $sampleMetadata.appendChild($p);
        };
    });

    console.log('test test')
    // update pie and bubble plots
    var plotURL = `/samples/${dataset}`;
    d3.json(plotURL, function(error, response) {
                
        if (error) return console.log(error);
        
        var newPie = {};
        var newBubble = {};
        
        var idSlice = response.otu_ids.slice(0,10);
        var valueSlice = response.sample_values.slice(0,10);
        
        var pieIds = [];
        var pieValues = [];
        
        for (var i = 0; i < valueSlice.length; i++) {
            if (valueSlice[i] != 0) {
                pieIds.push(idSlice[i]);
                pieValues.push(valueSlice[i]);
            };
        };
        
        newPie["value"] = pieValues;
        newPie["labels"] = pieIds;

        var bubbleIds = [];
        var bubbleValues = [];
        
        for (var i = 0; i < response.sample_values.length; i++) {
            if (response.sample_values[i] != 0) {
                bubbleIds.push(response.otu_ids[i]);
                bubbleValues.push(response.sample_values[i])
            };
        };
        
        newBubble["x"] = bubbleIds;
        newBubble["y"] = bubbleValues;
        
        d3.json("/otu", function(error, response) {
            if (error) console.log(error);
            
            var pieLabels = [];
            for (var i =  0; i < pieIds.length; i++) {
                pieLabels.push(response[pieIds[i]]);
            };
            newPie["hovertext"] = pieLabels;
            
            var bubbleLabels = [];
            for (var i = 0; i < bubbleIds.length; i++) {
                bubbleLabels.push(response[bubbleIds[i]]);
            };
            newBubble["text"] = bubbleLabels;
            
            updatePlots(newPie, newBubble);
        });
    });
};
// run function
init();

