import inherits from 'inherits-browser';
import BaseReplaceMenuProvider from 'bpmn-js/lib/features/popup-menu/ReplaceMenuProvider';
import { isDifferentType } from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import * as replaceOptions from 'bpmn-js/lib/features/replace/ReplaceOptions';

/**
 * @param {Injector} injector
 * @constructor
 */
export default function ReplaceMenuProvider(injector) {
  injector.invoke(BaseReplaceMenuProvider, this);
}

inherits(ReplaceMenuProvider, BaseReplaceMenuProvider);

ReplaceMenuProvider.$inject = [
  'injector'
];

ReplaceMenuProvider.prototype._register = function() {
  this._popupMenu.registerProvider('chor-replace', this);
};

ReplaceMenuProvider.prototype.getPopupMenuEntries = function(element) {
  let businessObject = element.businessObject;
  let entries;

  if (!this._rules.allowed('shape.replace', { element: element })) {
    return {};
  }

  var differentType = isDifferentType(element);
  var eventDefinitionType;
  var sameTypeEventOptions = [];

  if (is(businessObject, 'bpmn:Event') && !is(businessObject, 'bpmn:BoundaryEvent')) {
    eventDefinitionType = businessObject.get('eventDefinitions')[0]?.$type;
    sameTypeEventOptions = replaceOptions.TYPED_EVENT[eventDefinitionType] || [];
  }

  // start events
  if (is(businessObject, 'bpmn:StartEvent')) {
    entries = replaceOptions.START_EVENT.concat(sameTypeEventOptions).filter(differentType);
    return this._createEntries(element, entries);
  }

  // end events
  if (is(businessObject, 'bpmn:EndEvent')) {
    entries = replaceOptions.END_EVENT.concat(sameTypeEventOptions).filter(replaceOption => {
      const target = replaceOption.target;

      if (target.eventDefinitionType == 'bpmn:CancelEventDefinition' && !is(businessObject.$parent, 'bpmn:Transaction')) {
        return false;
      }

      return differentType(replaceOption);
    });
    return this._createEntries(element, entries);
  }

  // boundary events
  if (is(businessObject, 'bpmn:BoundaryEvent')) {
    entries = replaceOptions.BOUNDARY_EVENT.filter(differentType).filter(isInTargets([
      {
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:TimerEventDefinition'
      }, {
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:ConditionalEventDefinition'
      }, {
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:SignalEventDefinition'
      }
    ]));
    return this._createEntries(element, entries);
  }

  // intermediate events
  if (is(businessObject, 'bpmn:IntermediateCatchEvent') ||
      is(businessObject, 'bpmn:IntermediateThrowEvent')) {
    entries = replaceOptions.INTERMEDIATE_EVENT.concat(sameTypeEventOptions).filter(differentType);
    return this._createEntries(element, entries);
  }

  // gateways
  if (is(businessObject, 'bpmn:Gateway')) {
    entries = replaceOptions.GATEWAY.filter(differentType);
    return this._createEntries(element, entries);
  }

  // sequence flows
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return this._createSequenceFlowEntries(element, replaceOptions.SEQUENCE_FLOW);
  }

  return {};
};
