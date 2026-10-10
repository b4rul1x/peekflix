import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#EDEDEF', fontFamily: 'sans-serif' }}>
          <h3>Сталася помилка 😕</h3>
          <p style={{ color: '#9A9AA6', fontSize: 13 }}>
            Зроби, будь ласка, скрін цього повідомлення і скинь розробнику.
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#E0483E' }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;