Type: grilling
Status: open

## Question

How is phase order or dependency established when users build resource requirements first?

The latest discussion raised three possible approaches:

- The order in which phases are created.
- A workflow that supplies the valid phase order.
- Explicit dependency links between timeline blocks.

Decide:

- Can users create phases in any order and fix the order later?
- Should a workflow constrain which phase can be added next?
- Are dependencies attached to phases, resource requirements, or individual timeline blocks?
- What is the minimum viable behaviour for sequencing without introducing a dependency-builder UI?
- How should the system behave when a user creates Sign-off before Review or Prep?
