import React, { useState, useEffect } from 'react';
import './Quarantine.css';

export default function Quarantine({ threatCount, onLoadStatus }) {
  const [quarantineItems, setQuarantineItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuarantine();
  }, [threatCount]);

  const loadQuarantine = async () => {
    setLoading(true);
    try {
      const status = await window.electronAPI.getQuarantineStatus();
      setQuarantineItems(status.files || []);
    } catch (error) {
      console.error('Error loading quarantine:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (idx) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === quarantineItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(quarantineItems.map((_, idx) => idx)));
    }
  };

  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Delete ${selectedItems.size} items from quarantine?`)) {
      try {
        for (const idx of selectedItems) {
          const item = quarantineItems[idx];
          await window.electronAPI.deleteThreat(item.path);
        }
        setSelectedItems(new Set());
        loadQuarantine();
        onLoadStatus();
      } catch (error) {
        console.error('Error deleting items:', error);
      }
    }
  };

  const restoreSelected = async () => {
    if (selectedItems.size === 0) return;
    alert('Restore functionality requires tracking of original file locations. Please use manual restore.');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="quarantine">
      <h1>Quarantine Manager</h1>

      {/* Stats */}
      <div className="quarantine-stats">
        <div className="stat">
          <p className="label">Total Items</p>
          <p className="value">{quarantineItems.length}</p>
        </div>
        <div className="stat">
          <p className="label">Total Size</p>
          <p className="value">
            {formatFileSize(quarantineItems.reduce((sum, item) => sum + (item.size || 0), 0))}
          </p>
        </div>
        <div className="stat">
          <p className="label">Selected</p>
          <p className="value">{selectedItems.size}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="quarantine-actions">
        <button 
          className="btn-primary" 
          onClick={toggleSelectAll}
          disabled={quarantineItems.length === 0}
        >
          {selectedItems.size === quarantineItems.length ? 'Deselect All' : 'Select All'}
        </button>
        <button 
          className="btn-restore" 
          onClick={restoreSelected}
          disabled={selectedItems.size === 0}
        >
          Restore Selected
        </button>
        <button 
          className="btn-delete" 
          onClick={deleteSelected}
          disabled={selectedItems.size === 0}
        >
          Delete Selected
        </button>
      </div>

      {/* Items List */}
      <div className="quarantine-list">
        {loading ? (
          <p className="loading">Loading quarantine items...</p>
        ) : quarantineItems.length === 0 ? (
          <div className="empty-state">
            <p>✓ No items in quarantine</p>
            <p className="subtitle">Your system is clean and protected</p>
          </div>
        ) : (
          <>
            <h3>Quarantined Items ({quarantineItems.length})</h3>
            <div className="items-container">
              {quarantineItems.map((item, idx) => (
                <div key={idx} className={`item ${selectedItems.has(idx) ? 'selected' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.has(idx)}
                    onChange={() => toggleSelection(idx)}
                  />
                  <div className="item-info">
                    <p className="item-name" title={item.name}>{item.name}</p>
                    <p className="item-details">
                      <span>{formatFileSize(item.size)}</span>
                      <span className="separator">•</span>
                      <span>{new Date(parseInt(item.name.split('_')[0])).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Information */}
      <div className="quarantine-info">
        <h3>About Quarantine</h3>
        <p>
          Quarantine safely isolates suspicious files preventing them from executing on your system.
          Files in quarantine cannot harm your computer. You can restore them if they are determined to be safe.
        </p>
        <ul>
          <li>Quarantined files are stored in a secure location</li>
          <li>They cannot be executed or accessed by malware</li>
          <li>You can restore them at any time if needed</li>
          <li>Regularly review quarantine items for cleanup</li>
        </ul>
      </div>
    </div>
  );
}
