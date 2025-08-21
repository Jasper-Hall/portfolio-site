#!/bin/bash

# macOS-compatible Image Optimization Script
echo "🖼️  Starting macOS-compatible image optimization..."

# Create backup directory
mkdir -p image-backups
BACKUP_DIR="image-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Creating backups in $BACKUP_DIR..."

# Find and optimize images
find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    # Get file size in bytes (macOS compatible)
    original_size=$(stat -f%z "$file")
    
    # Only process files >800KB
    if [ $original_size -gt 800000 ]; then
        echo "🔄 Processing: $file ($(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size} bytes"))"
        
        # Backup original
        rel_path=$(echo "$file" | sed 's|^public/projects/||')
        backup_file="$BACKUP_DIR/$rel_path"
        backup_dir=$(dirname "$backup_file")
        mkdir -p "$backup_dir"
        cp "$file" "$backup_file"
        
        # Determine optimization settings based on size
        if [ $original_size -gt 5000000 ]; then
            # Very large files (>5MB) - aggressive optimization
            max_width=1600
            quality=80
        elif [ $original_size -gt 2000000 ]; then
            # Large files (>2MB) - moderate optimization  
            max_width=1600
            quality=82
        else
            # Medium files - light optimization
            max_width=1400
            quality=85
        fi
        
        # Use ffmpeg to optimize
        ffmpeg -i "$file" -vf "scale='min($max_width,iw):-1'" -q:v $quality -y "${file}_temp.jpg" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            # Get new size
            new_size=$(stat -f%z "${file}_temp.jpg")
            
            # Calculate savings
            savings=$((original_size - new_size))
            percent_savings=$((savings * 100 / original_size))
            
            # Only replace if we saved significant space
            if [ $percent_savings -gt 15 ] || [ $savings -gt 300000 ]; then
                mv "${file}_temp.jpg" "$file"
                echo "✅ Optimized: $(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B") → $(numfmt --to=iec $new_size 2>/dev/null || echo "${new_size}B") (-${percent_savings}%)"
            else
                rm "${file}_temp.jpg"
                echo "⏭️  Skipped: Already efficient ($(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B"))"
            fi
        else
            echo "❌ Failed to process: $file"
            rm -f "${file}_temp.jpg"
        fi
    else
        echo "⏭️  Skipping small file: $file ($(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B"))"
    fi
done

echo ""
echo "📊 Calculating total savings..."

# Calculate total before/after sizes
original_total=0
new_total=0

find "$BACKUP_DIR" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read backup_file; do
    if [ -f "$backup_file" ]; then
        size=$(stat -f%z "$backup_file")
        echo $size
    fi
done | awk '{sum += $1} END {print sum}' > /tmp/original_total.txt

find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read current_file; do
    if [ -f "$current_file" ]; then
        size=$(stat -f%z "$current_file")
        echo $size
    fi
done | awk '{sum += $1} END {print sum}' > /tmp/new_total.txt

original_total=$(cat /tmp/original_total.txt 2>/dev/null || echo "0")
new_total=$(cat /tmp/new_total.txt 2>/dev/null || echo "0")

if [ "$original_total" != "0" ] && [ "$new_total" != "0" ]; then
    savings=$((original_total - new_total))
    percent_savings=$((savings * 100 / original_total))
    
    echo "📦 Original total: $(numfmt --to=iec $original_total 2>/dev/null || echo "${original_total}B")"
    echo "📦 Optimized total: $(numfmt --to=iec $new_total 2>/dev/null || echo "${new_total}B")"
    echo "💾 Total savings: $(numfmt --to=iec $savings 2>/dev/null || echo "${savings}B") (-${percent_savings}%)"
fi

# Cleanup temp files
rm -f /tmp/original_total.txt /tmp/new_total.txt

echo ""
echo "🎉 Optimization complete!"
echo "💾 Backups stored in: $BACKUP_DIR"
echo "🚀 Your preloader should now load much faster!"
