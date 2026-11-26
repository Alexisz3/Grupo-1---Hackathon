import {useEffect, useState} from 'react';
import {schoolService} from '../services/school-service.js';

// «Mis cuentos»: los cuentos guardados, de a 20, con «ver más»
export function useStoryShelf() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load(next) {
    setLoading(true);
    const result = await schoolService.stories(next).catch(() => null);
    if (result) {
      setItems(value => next === 1 ? result.items : [...value, ...result.items]);
      setTotal(result.total);
      setPage(next);
    }
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  return {items, total, loading, more:items.length < total ? () => load(page + 1) : null};
}
