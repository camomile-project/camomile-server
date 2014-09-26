#!/bin/sh
 
PASSWORD="camomile"
 
function usage()
{
    echo "Run Camomile Annotation Server"
    echo ""
    echo "   -h --help            Show this message"
    echo "   --password=$PASSWORD  Set root password [default: $PASSWORD]"
    echo ""
}
 
while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        -h | --help)
            usage
            exit
            ;;
        --password)
            PASSWORD=$VALUE
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done

node /app/app.js --root_pass=$PASSWORD --video_path=/media --db_port=$MONGODB_PORT_27017_TCP_PORT --db_host=$MONGODB_PORT_27017_TCP_ADDR
