import { FC, InputHTMLAttributes } from 'react';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: FC<IInputProps> = ({ label, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <label htmlFor={props.name}>{label}</label>
      <input width="100%" id={props.name} {...props} />
    </div>
  );
};

export default Input;
