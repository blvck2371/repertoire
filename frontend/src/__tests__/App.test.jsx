import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('affiche le titre et le formulaire', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Répertoire Téléphonique/)).toBeInTheDocument();
    });
    expect(screen.getByText('Gérez vos contacts')).toBeInTheDocument();
    expect(screen.getByText('Liste des contacts')).toBeInTheDocument();
  });

  it('affiche Chargement... puis la liste', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<App />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Aucun contact/)).toBeInTheDocument();
    });
  });

  it('affiche les contacts après chargement', async () => {
    const contacts = [
      { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' }
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le chargement échoue', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Erreur réseau'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });

  it('crée un contact via le formulaire', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Martin' } });
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Pierre' } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0612345678' } });
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), { target: { value: 'pierre@test.fr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/contacts', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Martin')
      }));
    });
  });
});
