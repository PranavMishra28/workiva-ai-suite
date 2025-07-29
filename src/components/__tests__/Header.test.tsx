import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Header } from '../Header';

// Mock the logo import
vi.mock('../../assets/logo.png', () => ({
  default: '/logo.png',
}));

// Mock the chat store
vi.mock('../../store/chatStore', () => ({
  useChatStore: () => ({
    toggleSidebar: vi.fn(),
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      },
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });
  });

  it('renders logo and text with proper left alignment', () => {
    render(<Header />);

    const logo = screen.getByAltText('Workiva logo');
    const title = screen.getByText('Workiva AI Suite');
    const subtitle = screen.getByText('Powered by DeepSeek R1 0528 (Free)');

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);

    const themeButton = screen.getByRole('button', { name: /switch to/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('renders sidebar toggle button on mobile', () => {
    render(<Header />);

    const sidebarButton = screen.getByRole('button', {
      name: /toggle sidebar/i,
    });
    expect(sidebarButton).toBeInTheDocument();
    expect(sidebarButton).toHaveClass('sm:hidden');
  });

  it('has proper responsive text sizing', () => {
    render(<Header />);

    const title = screen.getByText('Workiva AI Suite');
    const subtitle = screen.getByText('Powered by DeepSeek R1 0528 (Free)');

    expect(title).toHaveClass('text-base', 'sm:text-lg');
    expect(subtitle).toHaveClass('text-xs', 'sm:text-sm');
  });

  it('has proper logo sizing and styling', () => {
    render(<Header />);

    const logo = screen.getByAltText('Workiva logo');
    const logoContainer = logo.parentElement;

    expect(logo).toHaveClass(
      'h-8',
      'w-8',
      'sm:h-10',
      'sm:w-10',
      'rounded-md',
      'object-cover'
    );
    expect(logoContainer).toHaveClass(
      'p-1',
      'bg-white/50',
      'dark:bg-gray-800/50',
      'rounded-lg',
      'shadow-sm'
    );
  });

  it('has proper layout structure for left anchoring', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    const container = header.firstElementChild;
    const logoTextContainer = container?.firstElementChild;

    expect(container).toHaveClass(
      'flex',
      'justify-between',
      'items-center',
      'h-14'
    );
    expect(logoTextContainer).toHaveClass(
      'flex',
      'items-center',
      'gap-3',
      'flex-shrink-0'
    );
  });

  it('has proper padding for responsive behavior', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    const container = header.firstElementChild;

    expect(container).toHaveClass('pl-2', 'sm:pl-4', 'pr-4');
  });
});
