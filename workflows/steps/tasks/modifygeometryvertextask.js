var inherit = g3wsdk.core.utils.inherit;
var base =  g3wsdk.core.utils.base;

var EditingTask = require('./editingtask');

function ModifyGeometryVertexTask(options={}){
  this.drawInteraction = null;
  this._originalStyle = null;
  this._feature = null;
  this._deleteCondition = options.deleteCondition || undefined;
  this._snap = options.snap === false ? false : true;
  this._snapInteraction = null;
  base(this, options);
}

inherit(ModifyGeometryVertexTask, EditingTask);


var proto = ModifyGeometryVertexTask.prototype;

proto.run = function(inputs, context) {
  var d = $.Deferred();
  var editingLayer = inputs.layer;
  var session = context.session;
  var originalLayer = context.layer;
  var layerId = originalLayer.getId();
  var originalFeature,
    newFeature;
  var feature = this._feature = inputs.features[0];
  this._originalStyle = editingLayer.getStyle();
  var style = [
    new ol.style.Style({
      stroke : new ol.style.Stroke({
        color : "grey",
        width: 3
      })
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: 'orange'
        })
      }),
      geometry: function(feature) {
        // return the coordinates of the first ring of the polygon
        var coordinates = feature.getGeometry().getCoordinates()[0];
        return new ol.geom.MultiPoint(coordinates);
      }
    })
  ];
  feature.setStyle(style);
  var features = new ol.Collection(inputs.features);
  this._modifyInteraction = new ol.interaction.Modify({
    features: features,
    deleteCondition: this._deleteCondition
  });

  this.addInteraction(this._modifyInteraction);

  this._modifyInteraction.on('modifystart', function(e) {
    var feature = e.features.getArray()[0];
    originalFeature = feature.clone();
  });

  this._modifyInteraction.on('modifyend',function(e){
    var feature = e.features.getArray()[0];
    if (feature.getGeometry().getExtent() != originalFeature.getGeometry().getExtent()) {
      newFeature = feature.clone();
      session.pushUpdate(layerId, newFeature, originalFeature);
      //self._selectInteraction.getFeatures().clear();
      inputs.features.push(newFeature);
      // ritorno come outpu l'input layer che sarà modificato
      d.resolve(inputs);
    }
  });

  if (this._snap) {
    this._snapInteraction = new ol.interaction.Snap({
      source: editingLayer.getSource()
    });
    this.addInteraction(this._snapInteraction);
  }
  return d.promise();
};


proto.stop = function(){
  if (this._snapInteraction) {
     this.removeInteraction(this._snapInteraction);
     this._snapInteraction = null;
  }
  this._feature.setStyle(this._originalStyle);
  this.removeInteraction(this._modifyInteraction);
  this._modifyInteraction = null;
  return true;
};


proto.removePoint = function(coordinate){
  if (this._modifyInteraction) {
    // provo a rimuovere l'ultimo punto. Nel caso non esista la geometria gestisco silenziosamente l'errore
    try{
      this._modifyInteraction.removePoint();
    }
    catch (e){
      console.log(e);
    }
  }
};



proto._isNew = function(feature){
  return (!_.isNil(this.editingLayer.getSource().getFeatureById(feature.getId())));
};

module.exports = ModifyGeometryVertexTask;
