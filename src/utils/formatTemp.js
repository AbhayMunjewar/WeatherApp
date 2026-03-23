export const formatTemp = (temp) => {
  if (temp === undefined || temp === null) return '--';
  const t = Math.round(temp);
  return t < 10 && t > 0 ? `0${t}` : t < 0 && t > -10 ? `-0${Math.abs(t)}` : `${t}`;
};
