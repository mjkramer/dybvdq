import React from 'react';
import { Button, ButtonProps } from 'reactstrap';
import { Omit } from '../util';

// HACK
// ButtonProps extends React.HTMLProps<HTMLButtonElement>,
// which extends React.ClassAttributes<HTMLButtonElement>,
// which includes { ref?: Ref<HTMLButtonElement> }.
// However, JSX.IntrinsicClassAttributes<Button>
// extends React.ClassAttributes<Button>!
// Thus, according to the rules of TSX, our Button needs to
// receive a Ref<Button>, while our ButtonProps are trying to
// give it a Ref<HTMLButtonElement>...
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20461

// We might also be able to use Partial<ButtonProps>
export type Props = Omit<ButtonProps, 'ref'>;

export const NavButton: React.SFC<Props> = (props: Props) => (
  <Button color="primary" outline={true} {...props} />
);

export type ButtonProps = ButtonProps;
export default NavButton;
