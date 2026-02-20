import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  it('affiche le formulaire avec les champs', () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('06 12 34 56 78')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jean.dupont@email.com')).toBeInTheDocument();
  });

  it('affiche le bouton Ajouter en mode création', () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('appelle onSubmit avec les données du formulaire', async () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Martin' } });
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Pierre' } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0611223344' } });
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), { target: { value: 'pierre@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      nom: 'Martin',
      prenom: 'Pierre',
      telephone: '0611223344',
      email: 'pierre@test.com'
    });
  });
});
