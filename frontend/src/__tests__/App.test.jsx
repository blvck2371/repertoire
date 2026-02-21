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

  it('affiche une erreur si la création échoue', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Err' } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0612345678' } });
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), { target: { value: 'e@t.fr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });

  it('met à jour un contact', async () => {
    const contacts = [
      { _id: '123', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' }
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ ...contacts[0], nom: 'Martin' }]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Martin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/contacts/123', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Martin')
      }));
    });
  });

  it('affiche une erreur si la mise à jour échoue', async () => {
    const contacts = [
      { _id: '123', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' }
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) })
      .mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mettre à jour' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });

  it('supprime un contact', async () => {
    const contacts = [
      { _id: '123', nom: 'ASuppr', prenom: 'Test', telephone: '06', email: 'a@t.fr' }
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test ASuppr')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/contacts/123', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });

  it('affiche une erreur si la suppression échoue', async () => {
    const contacts = [
      { _id: '123', nom: 'Err', prenom: 'Del', telephone: '06', email: 'e@t.fr' }
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) })
      .mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Del Err')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });

  it('ne supprime pas si l\'utilisateur annule la confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const contacts = [
      { _id: '123', nom: 'Keep', prenom: 'Me', telephone: '06', email: 'k@t.fr' }
    ];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(contacts) });
    globalThis.fetch = fetchMock;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Me Keep')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
