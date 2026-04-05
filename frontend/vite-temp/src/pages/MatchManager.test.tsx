import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, screen } from '@testing-library/react';
import MatchManager from './MatchManager';

describe('MatchManager component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders without crashing and shows instructions', () => {
        render(<MatchManager />);
        expect(screen.getByText(/Seleccione un partido/i)).toBeInTheDocument();
    });

    it('allows creating a new match', () => {
        render(<MatchManager />);

        fireEvent.click(screen.getByText(/Crear Partido/i));
        const input = screen.getByLabelText(/Fecha/i);
        expect(input).toBeInTheDocument();
        // set a date then click save
        fireEvent.change(input, { target: { value: '2026-03-13T10:00' } });
        fireEvent.click(screen.getByText(/Guardar/i));
        // match list should now contain one item
        const items = screen.getAllByRole('listitem');
        expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('disables incident button when no players', () => {
        render(<MatchManager />);
        fireEvent.click(screen.getByText(/Crear Partido/i));
        fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2026-03-13T10:00' } });
        fireEvent.click(screen.getByText(/Guardar/i));
        // ensure incident form submit disabled because no players added
        const addButton = screen.getByText(/Agregar Incidente/i);
        expect(addButton).toBeDisabled();
    });
});
