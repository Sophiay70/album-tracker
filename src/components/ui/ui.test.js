import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../StarRating';
import OverflowMenu from './OverflowMenu';
import Modal from './Modal';

function RatingHarness() {
  const [rating, setRating] = useState(0);
  return <StarRating rating={rating} onRate={setRating} label="Your rating" />;
}

test('read-only stars announce their value', () => {
  render(<StarRating rating={4} readOnly />);
  expect(screen.getByRole('img', { name: 'Rated 4 out of 5' })).toBeInTheDocument();
});

test('interactive stars work with arrow keys', () => {
  render(<RatingHarness />);
  const group = screen.getByRole('radiogroup', { name: 'Your rating' });
  fireEvent.keyDown(group, { key: 'ArrowRight' });
  fireEvent.keyDown(group, { key: 'ArrowRight' });
  expect(screen.getByRole('radio', { name: '2 stars' })).toHaveAttribute('aria-checked', 'true');
  fireEvent.keyDown(group, { key: 'End' });
  expect(screen.getByRole('radio', { name: '5 stars' })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByRole('radio', { name: '5 stars' })).toHaveFocus();
});

test('overflow menu opens, runs an action and closes on Escape', () => {
  const onEdit = jest.fn();
  render(<OverflowMenu label="Review actions" items={[{ label: 'Edit', onSelect: onEdit }, { label: 'Delete', onSelect: () => {} }]} />);
  const trigger = screen.getByRole('button', { name: 'Review actions' });
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
  expect(onEdit).toHaveBeenCalled();
});

test('modal closes on Escape and is labelled by its title', () => {
  const onClose = jest.fn();
  render(<Modal open onClose={onClose} title="Add a record"><input aria-label="Album" /></Modal>);
  expect(screen.getByRole('dialog', { name: 'Add a record' })).toBeInTheDocument();
  expect(screen.getByLabelText('Album')).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalled();
});
