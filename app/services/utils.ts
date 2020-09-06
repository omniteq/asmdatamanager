export default function findObjectByProperty(
  array: any[],
  propertyName: string
) {
  const index = array.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, propertyName);
  });
  return index;
}
