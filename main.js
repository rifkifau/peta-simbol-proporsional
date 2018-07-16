var map, layer;

require([
    "esri/Color",
    "esri/dijit/Legend",
    "esri/dijit/PopupTemplate",
    "esri/layers/FeatureLayer",

    "esri/map",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleMarkerSymbol",

    "dojo/domReady!"
  ],
  function (Color, Legend, PopupTemplate, FeatureLayer,
    Map, ClassBreaksRenderer, SimpleFillSymbol, SimpleMarkerSymbol){

    map = new Map("mapDiv", {
      basemap: "dark-gray",
      center: [115.874572, -2.465325],
      zoom: 5
    });

    var layerUrl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
    var rendererField = "M050_07";  //Average farm expenses

    //----------------------
    // Create renderer
    //----------------------

    var renderer = new ClassBreaksRenderer();
    renderer.attributeField = rendererField;

    //----------------------
    // Fill symbol
    //----------------------

    // (1) Define a FILL symbol used to draw county polygons.
    var fillSymbol = new SimpleFillSymbol();
  //warna polygon administrasi transparan
    fillSymbol.setColor(new Color([0, 0, 0, 0]));
  //warna outline dari batas administrasi
    fillSymbol.outline.setColor(new Color([255, 255, 133, .5]));
    fillSymbol.outline.setWidth(1);

    renderer.backgroundFillSymbol = fillSymbol;

    //----------------------
    // Circle marker symbol
    //----------------------

    // (2.A) Define circle MARKER symbol to be drawn at the centroid
    // of each polygon.
    var markerSymbol = new SimpleMarkerSymbol();
  //warna simbol proporsional
    markerSymbol.setColor(new Color([0, 139, 79, 1]));
    markerSymbol.setSize(12);
  //warna outlinenya
    markerSymbol.outline.setColor(new Color([51, 51, 51, 1]));
    markerSymbol.outline.setWidth(1);

    // (2.B) Make sure the MARKER symbol defined above is used to
    // draw polygons that have valid numeric field value.
    renderer.addBreak({
      minValue: -9007199254740991,
      maxValue: 9007199254740991,
      symbol: markerSymbol
    });

    //----------------------
    // Visual variables
    //----------------------

    renderer.setVisualVariables([
      // (3.A) This visual variable determines the size of circle marker
      // for each polygon based on the value of its attribute field.
      {
        type: "sizeInfo",
        field: rendererField,
        minDataValue: 0,
        maxDataValue: 2638797,
        valueUnit: "unknown",

        // The SMALLEST marker size at any given map scale is determined by
        // minSize specification.

        minSize: {
          type: "sizeInfo",
          expression: "view.scale",
          stops: [
            {value: 1128, size: 16},
            {value: 144447, size: 16},
            {value: 18489298, size: 4},
            {value: 147914382, size: 4},
            {value: 591657528, size: 2}
          ]
        },

        // The LARGEST marker size at any given map scale is determined by
        // maxSize specification.

        maxSize: {
          type: "sizeInfo",
          expression: "view.scale",
          stops: [
            {value: 1128, size: 80},
            {value: 144447, size: 80},
            {value: 18489298, size: 50},
            {value: 147914382, size: 50},
            {value: 591657528, size: 25}
          ]
        }
      },

      // (3.B) This visual variable determines the outline width of polygons
      // based on map scale.
      {
        type: "sizeInfo",
        target: "outline",
        expression: "view.scale",
        stops: [
          {value: 1153765, size: 2},
          {value: 7211032, size: 1},
          {value: 28844129, size: 0}
        ]
      }
    ]);

    //----------------------
    // Create feature layer
    //----------------------

    layer = new FeatureLayer(layerUrl, {
      opacity: 0.8,
      //field yang dimunculkan
      outFields: [rendererField, "COUNTY", "STATE"],
      definitionExpression: "AREA > 0.1",
      //format popup yang muncul
      infoTemplate: new PopupTemplate({
        title: "{COUNTY} County, {STATE}",
        fieldInfos: [
          {
            fieldName: rendererField,
            label: "Average Farm Expenses",
            visible: true,
            format: {places: 0}
          }
        ]
      })
    });

    layer.setRenderer(renderer);

    //----------------------
    // Create legend
    //----------------------

    var legend = new Legend({
      map: map,
      layerInfos: [
        {layer: layer, title: "2007 Crops"}
      ]
    }, "legendDiv");

    legend.startup();

    map.on("layer-add", function (){
      legend.refresh();
    });

    map.addLayer(layer);
  });
