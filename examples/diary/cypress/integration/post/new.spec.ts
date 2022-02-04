describe('Creation', () => {
  it('should be able to create a thread', () => {
    cy.visit('/post/new');

    cy.get('button').contains('Create').click();

    cy.url().should('include', '/post/');
    cy.contains('Title : taitoru');
    cy.contains('Text : tekisuto');

    cy.reload();

    cy.contains('Title : taitoru');
    cy.contains('Text : tekisuto');
  });
});
