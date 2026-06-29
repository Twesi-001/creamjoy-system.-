from app.database import execute_query, execute_insert, execute_update

class Batch:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT 
                b.*, 
                s.name as supervisor_name,
                (SELECT SUM(bp.quantity_produced) 
                 FROM batch_products bp 
                 WHERE bp.batch_id = b.batch_id) as total_units
            FROM batches b
            LEFT JOIN staff s ON b.supervisor_id = s.staff_id
            ORDER BY b.batch_date DESC
        """)
    
    @staticmethod
    def get_by_id(batch_id):
        result = execute_query("""
            SELECT b.*, s.name as supervisor_name
            FROM batches b
            LEFT JOIN staff s ON b.supervisor_id = s.staff_id
            WHERE b.batch_id = %s
        """, (batch_id,))
        return result[0] if result else None
    
    @staticmethod
    def create(batch_number, batch_date, supervisor_id, notes=None):
        return execute_insert("""
            INSERT INTO batches (batch_number, batch_date, supervisor_id, notes)
            VALUES (%s, %s, %s, %s)
        """, (batch_number, batch_date, supervisor_id, notes))
    
    @staticmethod
    def update_status(batch_id, status):
        return execute_update("""
            UPDATE batches SET status = %s WHERE batch_id = %s
        """, (status, batch_id))
