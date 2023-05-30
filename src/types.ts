type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX | string;

export interface Person {
  name: string;
  color: Color;
}

export type WebsiteAwarenessData = {
  user: Partial<Person> & Pick<Person, "color">;
  fingerprint?: {
    letterId: number;
    top: number;
    left: number;
  };
};
