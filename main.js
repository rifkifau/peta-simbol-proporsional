var map, layer;

require([
    "esri/Color",
    "esri/dijit/Legend",
    "esri/dijit/PopupTemplate",
    "esri/layers/FeatureLayer",

    "esri/map",
    "./src/geojsonlayer.js",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    'esri/request',
    'esri/config',

    "dojo/domReady!"
  ],
  function (Color, Legend, PopupTemplate, FeatureLayer,
    Map, GeoJsonLayer, ClassBreaksRenderer, SimpleFillSymbol, SimpleMarkerSymbol, esriRequest, esriConfig){

    map = new Map("mapDiv", {
      basemap: "dark-gray",
      // center: [115.874572, -2.465325], //Indonesia
      center: [115.110104, -8.447432], //Bali
      zoom: 10
    });
    // geoJsonLayer = new GeoJsonLayer({
    //     url : "data/bali2010.json"
    // });
    var layerkuh = "https://gis.dukcapil.kemendagri.go.id/arcgis/rest/services/Hosted/Batas_Administrasi_Indonesia/MapServer/1"
    var rendererField = "jumlah_penduduk";


    //----------------------
    // Create renderer
    //----------------------

    var renderer = new ClassBreaksRenderer();
    renderer.attributeField = rendererField;

    //----------------------
    // Fill symbol
    //----------------------
console.log(renderer.attributeField);
    // (1) Define a FILL symbol used to draw county polygons.
    var fillSymbol = new SimpleFillSymbol();
  //warna polygon administrasi transparan
    fillSymbol.setColor(new Color([0, 0, 0, 1]));
  //warna outline dari batas administrasi
    fillSymbol.outline.setColor(new Color([255, 255, 133, .5]));
    fillSymbol.outline.setWidth(1);

    renderer.backgroundFillSymbol = fillSymbol;
console.log(fillSymbol);
    //----------------------
    // Circle marker symbol
    //----------------------

    // (2.A) Define circle MARKER symbol to be drawn at the centroid
    // of each polygon.
    var markerSymbol = new SimpleMarkerSymbol();
  //warna simbol proporsional
    markerSymbol.setColor(new Color([100, 139, 79, 1]));
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
        minDataValue: 500000,
        maxDataValue: 30000000,
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

    layer = new FeatureLayer(layerkuh, {
      opacity: 0.8,
      //field yang dimunculkan
      outFields: [rendererField, "nama_kab", "pria", "wanita", "luas_wilayah"],
      definitionExpression: "luas_wilayah > 0.1",
      //format popup yang muncul
      infoTemplate: new PopupTemplate({
        title: "Kab/Kota {nama_kab}",
        fieldInfos: [
          {
            fieldName: rendererField,
            label: "Jumlah Penduduk (jiwa)",
            visible: true,
            format: {places: 0}
          },
          {
            fieldName: "pria",
            label: "Laki-laki (jiwa)",
            visible: false,
            format: {places: 0}
          },
          {
            fieldName: "wanita",
            label: "Perempuan (jiwa)",
            visible: false,
            format: {places: 0}
          },
          {
            fieldName: "luas_wilayah",
            label: "Luas Wilayah",
            visible: true,
            format: {places: 0}
          }
        ],
        mediaInfos:[{ //define the pie chart
          title: "Grafik",
          type:"piechart",
          value:{
            theme: "Grasshopper",
            fields:["pria","wanita"],
            // tooltipField: ["laki_laki","perempuan"],
          }
        }]
      })
    });

    layer.setRenderer(renderer);

    //----------------------
    // Create legend
    //----------------------

    var legend = new Legend({
      map: map,
      layerInfos: [
        {layer: layer, title: "Penduduk Bali (2010)"}
      ]
    }, "legendDiv");

    legend.startup();

    map.on("layer-add", function (){
      legend.refresh();
    });

    map.addLayer(layer);
  });
