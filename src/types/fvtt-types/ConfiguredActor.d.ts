export { };

declare global {
  class Actor5e<
    SubType extends Actor.SubType = Actor.SubType,
  > extends Actor<SubType> {
    classes: Record<string, Item5e<'class'>>;
    items: Item[];
  }
}
