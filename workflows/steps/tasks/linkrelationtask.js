var inherit = g3wsdk.core.utils.inherit;
var base =  g3wsdk.core.utils.base;
var EditingTask = require('./editingtask');
var GUI = g3wsdk.gui.GUI;
var PickFeatureInteraction = g3wsdk.ol3.interactions.PickFeatureInteraction;



// classe  per l'aggiungere una relazione
function LinkRelationTask(options) {
  options = options || {};
  base(this, options);
}

inherit(LinkRelationTask, EditingTask);

var proto = LinkRelationTask.prototype;

// metodo eseguito all'avvio del tool
proto.run = function(inputs, context) {
  var context = context;
  var d = $.Deferred();
  console.log('Add relation task run.......');
  GUI.setModal(false);
  var layer = context.layer;
  var layerType = layer.getType();
  //var style = this.editor._editingVectorStyle ? this.editor._editingVectorStyle.edit : null;
  // vado a settare i layers su cui faccio l'interacion agisce
  var editingLayer = inputs.layer;
  if (layerType == 'vector') {
    this.pickFeatureInteraction = new PickFeatureInteraction({
      layers: [editingLayer]
    });
    // aggiungo
    this.addInteraction(this.pickFeatureInteraction);
    // gestisco l'evento
    this.pickFeatureInteraction.on('picked', function(e) {
      var relation = e.feature;
      var originalRelation = relation.clone();
      inputs.features.push(relation);
      inputs.features.push(originalRelation);
      GUI.setModal(true);
      d.resolve(inputs);
    });
  } else {
    d.resolve()
  }

  return d.promise()
};

// metodo eseguito alla disattivazione del tool
proto.stop = function() {
  console.log('stop add relation task');
  GUI.setModal(true);
  this.removeInteraction(this.pickFeatureInteraction);
  this.pickFeatureInteraction = null;
  return true;
};


module.exports = LinkRelationTask;