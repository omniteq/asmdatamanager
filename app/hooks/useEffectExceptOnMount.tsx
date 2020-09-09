import React from 'react';

/**
 * Identical to React.useEffect, except that it never runs on mount. This is
 * the equivalent of the componentDidUpdate lifecycle function.
 *
 * @param {function:function} effect - A useEffect effect.
 * @param {array} [dependencies] - useEffect dependency list.
 */
const useEffectExceptOnMount = (effect: any, dependencies: any[]) => {
  const mounted = React.useRef(false);
  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (mounted.current) {
      const unmount = effect();
      return () => unmount && unmount();
    }
    mounted.current = true;
  }, dependencies);

  // Reset on unmount for the next mount.
  React.useEffect(() => {
    return () => {
      mounted.current = false;
      return undefined;
    };
  }, []);
};

export default useEffectExceptOnMount;
