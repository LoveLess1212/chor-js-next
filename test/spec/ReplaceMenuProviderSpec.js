import { bootstrapChorModeler, inject } from '../TestHelper';


describe('replace menu provider', function() {

  const exampleXML = require('../resources/example.bpmn');

  beforeEach(bootstrapChorModeler(exampleXML));

  it('should provide change element action for end events', inject(function(contextPad, elementRegistry) {
    const endEvent = elementRegistry.get('EndEvent_1');
    const entries = contextPad.getEntries(endEvent);

    expect(entries.replace).to.exist;
    expect(entries.replace.title).to.equal('Change element');
  }));

  it('should provide typed end event replacements', inject(function(popupMenu, elementRegistry) {
    const endEvent = elementRegistry.get('EndEvent_1');

    expect(popupMenu.isEmpty(endEvent, 'chor-replace')).to.be.false;

    popupMenu.open(endEvent, 'chor-replace', { x: 0, y: 0 });

    expect(Object.keys(popupMenu._current.entries)).to.include.members([
      'replace-with-message-end',
      'replace-with-error-end',
      'replace-with-signal-end',
      'replace-with-terminate-end'
    ]);
  }));

  it('should not provide change element action for participant bands', inject(function(contextPad, elementRegistry) {
    const participantBand = elementRegistry.getAll().find(element => element.type === 'bpmn:Participant');
    const entries = contextPad.getEntries(participantBand);

    expect(entries.replace).not.to.exist;
  }));

});
