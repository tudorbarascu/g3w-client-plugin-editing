const {base, inherit} =  g3wsdk.core.utils;
const Layer = g3wsdk.core.layer.Layer;
const Geometry = g3wsdk.core.geometry.Geometry;
const EditingTask = require('./editingtask');
const Feature = g3wsdk.core.layer.features.Feature;
const {AreaInteraction, LengthInteraction} = g3wsdk.ol.interactions.measure;

function AddFeatureTask(options={}) {
  this._add = options.add === undefined ? true : options.add;
  this._busy = false;
  this.drawInteraction;
  this.measeureInteraction;
  this.drawingFeature;
  this._snap = options.snap === false ? false : true;
  this._finishCondition = options.finishCondition || (()=>true);
  this._condition = options.condition || (()=>true) ;
  base(this, options);
}

inherit(AddFeatureTask, EditingTask);

const proto = AddFeatureTask.prototype;

proto.run = function(inputs, context) {
  const d = $.Deferred();
  const originalLayer = inputs.layer;
  const editingLayer = originalLayer.getEditingLayer();
  const session = context.session;
  const layerId = originalLayer.getId();
  switch (originalLayer.getType()) {
    case Layer.LayerTypes.VECTOR:
      const originalGeometryType = originalLayer.getEditingGeometryType();
      this.geometryType = Geometry.getOLGeometry(originalGeometryType);
      const source = editingLayer.getSource();
      const attributes = originalLayer.getEditingFields();
      const temporarySource = new ol.source.Vector();
      this.drawInteraction = new ol.interaction.Draw({
        type: this.geometryType,
        source: temporarySource,
        condition: this._condition,
        freehandCondition: ol.events.condition.never,
        finishCondition: this._finishCondition
      });
      this.addInteraction(this.drawInteraction);
      this.drawInteraction.setActive(true);

      this.drawInteraction.on('drawstart', ({feature}) => {
        this.drawingFeature = feature;
      });
      this.drawInteraction.on('drawend', e => {
        let feature;
        if (this._add) {
          attributes.forEach(attribute => {
            e.feature.set(attribute.name, null);
          });
          feature = new Feature({
            feature: e.feature,
          });
          feature.setTemporaryId();
          source.addFeature(feature);
          session.pushAdd(layerId, feature);
        } else feature = e.feature;
        // set Z values based on layer Geoemtry
        feature = Geometry.addZValueToOLFeatureGeometry({
          feature,
          geometryType: originalGeometryType
        });
        inputs.features.push(feature);
        this.fireEvent('addfeature', feature); // emit event to get from subscribers
        d.resolve(inputs);
      });
      break;
  }
  return d.promise();
};

/**
 * Method to add Measure
 * @param geometryType
 */
proto.addMeasureInteraction = function(){
  const mapProjection = this.getMapService().getProjection();
  const measureOptions = {
    projection: mapProjection,
    drawColor: 'transparent',
    feature: this.drawingFeature
  };
  if (Geometry.isLineGeometryType(this.geometryType))
    this.measureInteraction = new LengthInteraction(measureOptions);
  else if (Geometry.isPolygonGeometryType(this.geometryType))
    this.measureInteraction = new AreaInteraction(measureOptions);
  if (this.measureInteraction){
    this.measureInteraction.setActive(true);
    this.addInteraction(this.measureInteraction);
  }
};

/**
 * Remove Measure Interaction
 */
proto.removeMeasureInteraction = function(){
  if (this.measureInteraction) {
    this.measureInteraction.clear();
    this.removeInteraction(this.measureInteraction);
    this.measureInteraction = null;
  }
};

proto.stop = function() {
  this.removeInteraction(this.drawInteraction);
  this.removeMeasureInteraction();
  this.drawInteraction = null;
  this.drawingFeature = null;
  return true;
};

proto._removeLastPoint = function() {
  if (this.drawInteraction) {
    try {
      this.drawInteraction.removeLastPoint();
    }
    catch (err) {
      console.log(err)
    }
  }
};

module.exports = AddFeatureTask;
