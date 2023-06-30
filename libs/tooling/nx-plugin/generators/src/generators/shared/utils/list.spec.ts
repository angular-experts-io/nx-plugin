import { diff } from './list';

describe('list utils', () => {
  it('should diff two lists', () => {
    const listOne = ['a', 'b', 'c'];
    const listTwo = ['a', 'b'];
    const expectedDiff = ['c'];

    expect(diff(listOne, listTwo)).toEqual(expectedDiff);
  });

  it('should return an empty list if lists dont differ', () => {
    const listOne = ['a', 'b', 'c'];
    const listTwo = ['a', 'b', 'c'];
    const expectedDiff = [];

    expect(diff(listOne, listTwo)).toEqual(expectedDiff);
  });
});
